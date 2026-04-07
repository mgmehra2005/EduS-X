from flask import jsonify, json, request, current_app
import jwt
from app import app
from app.db_connect import DBConnection
import requests

conn = DBConnection(app.config)
import json
import jwt
import requests
from flask import request



# TODO: Recheck Veolcity Response Calculation
def calculate_response_velocity(user_id):
    # We only care about CORRECT answers. Speed on a wrong answer isn't 'velocity', it's rushing.
    query = f"""
        SELECT e.difficulty_level, a.time_taken_seconds 
        FROM attempts a
        JOIN exercise e ON a.exercise_id = e.exercise_id
        WHERE a.user_id = {user_id} AND a.is_correct = 1
    """
    
    results = conn.get_db_cursor(query)

    if not results:
        return 0.0

    total_difficulty = 0
    total_time = 0

    print(results)
    for row in results:
        # We cap the minimum time at 1 second to avoid math errors
        duration = max(row.get("time_taken_seconds", 1), 1)
        total_difficulty += int(row.get("difficulty_level", 0))
        total_time += duration

    # Velocity = Difficulty Units per Second
    velocity = total_difficulty / total_time
    
    # We round to 3 decimal places because velocity changes are often small
    return round(velocity, 3)

def update_mastery(user_id, topic_id):
    query = f"SELECT a.is_correct, a.hints_used FROM attempts a JOIN exercise e ON a.exercise_id = e.exercise_id WHERE a.user_id = {user_id} AND e.topic_id = {topic_id}"

    result = conn.get_db_cursor(query)
    if not result :
        raise Exception("Error in fetching data for mastery_score")

    total = len(result)
    correct = sum(1 for a in result if a["is_correct"])
    total_hints = sum(a["hints_used"] for a in result)


    accuracy_rate = correct/total

    max_possible_hints = total * 3
    hint_efficiency = 1 - (total_hints / max_possible_hints)

    streak = 0
    max_streak = 0

    for attempt in result:
        if attempt["is_correct"]:
            streak += 1
            max_streak = max(max_streak, streak)
        else:
            streak = 0

    consistency_score = max_streak / total

    mastery_score = ((0.6 * accuracy_rate) + (0.3 * hint_efficiency) + (0.1 * consistency_score))

    if mastery_score < 0.5:
        level = "Beginner"
    elif mastery_score < 0.8:
        level = "Practicing"
    else:
        level = "Mastered"

    response_velocity = calculate_response_velocity(user_id)  

    update_mastery_score_query = f"INSERT INTO mastery (user_id, topic_id, accuracy_rate, hint_efficiency, consistency_score, mastery_score, mastery_level, streak, response_velocity) Values ({user_id}, {topic_id}, {accuracy_rate}, {hint_efficiency}, {consistency_score}, {mastery_score}, '{level}', {streak}, {response_velocity}) ON DUPLICATE KEY UPDATE accuracy_rate = VALUES(accuracy_rate), hint_efficiency = VALUES(hint_efficiency), consistency_score = VALUES(consistency_score), mastery_score = VALUES(mastery_score), mastery_level = VALUES(mastery_level), streak = VALUES(streak);"
    
    conn.push_db_cursor(update_mastery_score_query)


class EdubaAIEngine:
    
    HF_API_KEY = app.config["HF_API_KEY"]
    API_URL = "https://router.huggingface.co/v1/chat/completions"

    headers = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
    }

    SYSTEM_PROMPT = """
    You are Eduba, an explainable academic AI assistant.

    Respond strictly in JSON format:

    {
    "concept": "topic name",
    "difficulty": "Beginner/Intermediate/Advanced",
    "stepwise_explanation": [
        "Step 1 explanation",
        "Step 2 explanation",
        "Step 3 explanation"
    ],
    "final_answer": "short final answer"
    }
    """

    @staticmethod
    def gen_ai_question_builder(user_query):
        # --- 1. Identify Topic ID ---
        # Fetch all topics to match against the query
        topics = conn.get_db_cursor(f"SELECT topic_id, topic_name FROM topic")
        topic_id = None
        for t_id, t_name in topics:
            if t_name.lower() in user_query.lower():
                topic_id = t_id
                break
        
        if not topic_id:
            topic_id = 1 # Fallback to a General topic if no match

        # --- 2. Get User Context ---
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(" ")[1]
        user_id = jwt.decode(token, current_app.config.get('SECRET_KEY', 'MSpH4YN9VC94SGCjiGKKu2nD1TSwKP-aYy0YixJACAkeKfTGbQ_jkg'), algorithms=["HS256"])['sub']
        
        user_stats = conn.get_db_cursor(f"SELECT global_iq_score FROM users WHERE id = {user_id}")
        iq = user_stats[0] if user_stats else 100

        # --- 3. Structured AI Prompt ---
        prompt = f"""
        Generate 10 questions for Topic ID {topic_id} based on: '{user_query}'.
        User IQ: {iq}. 
        Return EXACTLY a JSON list of objects. Each object MUST have:
        "q": "The question text",
        "h": ["hint 1", "hint 2", "hint 3", "hint 4", "hint 5"],
        "a": "The correct answer",
        "d": "easy", "medium", or "hard"
        """

        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "model": "meta-llama/Llama-3.2-1B-Instruct:novita",
            "response_format": { "type": "json_object" } # Force JSON if supported
        }

        try:
            response = requests.post(EdubaAIEngine.API_URL, headers=EdubaAIEngine.headers, json=payload)
            ai_raw = response.json()["choices"][0]["message"]["content"]
            
            # Clean the string to ensure it's pure JSON
            questions_data = json.loads(ai_raw[ai_raw.find("["):ai_raw.rfind("]")+1])

            # --- 4. Store and Format Output ---
            final_output_list = []
            
            for item in questions_data:
                # Save to Database
                db_session.execute(text("""
                    INSERT INTO exercise (concept_id, problem_text, canonical_solution, difficulty_level, hints)
                    VALUES (:tid, :q, :a, :d, :h)
                """), {
                    'tid': topic_id, 'q': item['q'], 'a': item['a'], 
                    'd': item['d'], 'h': json.dumps(item['h'])
                })
                
                # Add to the list we return to the frontend
                final_output_list.append([item['q'], item['h'], item['a']])
            
            db_session.commit()
            return final_output_list

        except Exception as e:
            db_session.rollback()
            return [["Error generating questions", [str(e)], "N/A"]]


    @staticmethod
    def gen_ai_response_TTS(user_query):
        prompt = """ You are Eduba, an explainable academic AI assistant.

    Respond strictly in JSON format:

    {
    "concept": "topic name",
    "final_answer": "short final answer"
    }
    give answers in a way that is easy to understand for a student who is new to the topic. Avoid jargon and complex language. Use simple explanations and analogies where possible. Your answer should be descriptive and educational, not just a direct answer. and sholud be designed to in a way that it can be easily converted to speech for a student to listen and understand.
    """ + "\nUser Question: " + user_query

        payload = {
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "model": "meta-llama/Llama-3.2-1B-Instruct:novita"
        }
        try:
            response = requests.post(EdubaAIEngine.API_URL, headers=EdubaAIEngine.headers, json=payload)

            if response.status_code != 200:
                return {
                    "concept": "System Error",
                    "difficulty": "Beginner",
                    "stepwise_explanation": [
                        f"HF API returned status {response.status_code}"
                    ],
                    "final_answer": "Error"
                }

            result = response.json()
            text_output = result["choices"][0]["message"]["content"]

            # Extract JSON safely
            json_start = text_output.find("{")
            json_end = text_output.rfind("}") + 1

            if json_start == -1 or json_end == -1:
                raise ValueError("JSON not found in response")

            json_string = text_output[json_start:json_end]

            return json.loads(json_string)
        except Exception as e:
            return {
            "concept": "AI Error",
            "difficulty": "Beginner",
            "stepwise_explanation": [
                "AI response parsing failed.",
                str(e)
            ],
            "final_answer": "Error"
            }

    @staticmethod
    def gen_ai_response(user_query):
        prompt = EdubaAIEngine.SYSTEM_PROMPT + "\nUser Question: " + user_query

        payload = {
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "model": "meta-llama/Llama-3.2-1B-Instruct:novita"
        }
        try:
            response = requests.post(EdubaAIEngine.API_URL, headers=EdubaAIEngine.headers, json=payload)

            if response.status_code != 200:
                return {
                    "concept": "System Error",
                    "difficulty": "Beginner",
                    "stepwise_explanation": [
                        f"HF API returned status {response.status_code}"
                    ],
                    "final_answer": "Error"
                }

            result = response.json()
            text_output = result["choices"][0]["message"]["content"]

            # Extract JSON safely
            json_start = text_output.find("{")
            json_end = text_output.rfind("}") + 1

            if json_start == -1 or json_end == -1:
                raise ValueError("JSON not found in response")

            json_string = text_output[json_start:json_end]

            return json.loads(json_string)
        except Exception as e:
            return {
            "concept": "AI Error",
            "difficulty": "Beginner",
            "stepwise_explanation": [
                "AI response parsing failed.",
                str(e)
            ],
            "final_answer": "Error"
            }

def calculate_user_cognitive_index(user_id):
    # 1. Fetch all successful attempts and their difficulty
    # We join 'attempts' with 'exercise' to get the difficulty_level (1, 2, or 3)
    try:
        results = conn.get_db_cursor(f"""
            SELECT a.time_taken_seconds, e.difficulty_level, a.hints_used 
            FROM attempts a
            JOIN exercise e ON a.exercise_id = e.exercise_id
            WHERE a.user_id = {user_id} AND a.is_correct = 1
        """)
    except Exception as e:
        print(f"DB Error: {e}")
        return 80  # Baseline IQ in case of DB error

    if not results:
        return 80  # Baseline IQ

    total_weighted_score = 0
    
    for row in results:
        time = max(row.get("time_taken_seconds", 1), 1)  # Prevent division by zero
        difficulty = row.get("difficulty_level", 1)
        hints = row.get("hints_used", 0)

        # Formula: (Difficulty / Time) with a penalty for hints
        # We multiply by 100 to keep the numbers in a readable "IQ" range
        attempt_score = (int(difficulty) * 100) / (time + (hints * 5))
        total_weighted_score += attempt_score

    # 2. Average the performance across all correct attempts
    final_index = total_weighted_score / len(results)
    
    # 3. Normalize: Ensure it stays within a realistic range (e.g., 70 to 160)
    global_iq = round(max(70, min(160, 85 + final_index)), 2)

    def update_cognitive_score(cognitive_score: float) -> None:
        update_query = f'''
            UPDATE users set global_iq_score = {cognitive_score} where id = {user_id};
            '''
        conn.push_db_cursor(update_query)
        conn.push_db_cursor(f"UPDATE mastery set cognitive_index = {cognitive_score} where user_id = {user_id};")
    update_cognitive_score(global_iq)

    return global_iq

    
    '''
Dummy data for testing:
    
INSERT INTO exercise (topic_id, problem_text, canonical_solution, difficulty_level) VALUES
(57, 'x + 5 = 12', '7', 1),
(57, '10 - x = 4', '6', 1),
(57, '3x = 15', '5', 2),
(57, 'x / 4 = 3', '12', 2),
(57, '2x + 3 = 11', '4', 3),
(57, '5x - 10 = 20', '6', 3);



INSERT INTO attempts (user_id, exercise_id, student_answer, is_correct, hints_used, time_taken_seconds) VALUES
(4, 1, '7', 1, 0, 3),   
(4, 2, '6', 1, 0, 5),   
(4, 3, '5', 1, 2, 45),  
(4, 5, '4', 1, 0, 12),  
(4, 6, '10', 0, 1, 30); 

    '''