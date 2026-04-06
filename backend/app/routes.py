from flask import Blueprint, render_template, jsonify, request, json, g
from app import app
from app.db_connect import DBConnection
from app.eduba_engine import update_mastery, EdubaAIEngine
from app.jwt_utils import token_required

main = Blueprint("main", __name__)
conn = DBConnection(app.config)
aiEngine = EdubaAIEngine()

@main.route("/")
def index():
    return render_template("index.html")


# -----------------------Page Routes-----------------------
@main.route("/solution")
def solution_page():
    return render_template('response.html')

# -----------------------API Routes-----------------------

def exercise(concept_id):
    if not concept_id:
        return jsonify({"error": "Invalid concept id"})
    
    query = f'select exercise_id, problem_text, difficulty_level from exercise where concept_id = {concept_id};'
    try:
        result = conn.get_db_cursor(query)
        if result:
            return jsonify(result)
        else:
            return jsonify({"error": "No exercises found for the given concept_id"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def submit_answers(data):
    user_id = data.get("user_id")
    exercise_id = data.get("exercise_id")
    student_answer = data.get("student_answer")
    hints_used = data.get("hints_used", 0)

    concept_id_query = f"SELECT concept_id FROM exercise WHERE exercise_id = {exercise_id};"
    try:
        concept_id = conn.get_db_cursor(concept_id_query)[0]['concept_id']
    except Exception as e:
        return jsonify({"error": "Invalid exercise_id or error fetching concept_id: " + str(e)}), 400

    query = f"SELECT canonical_solution FROM exercise WHERE exercise_id = {exercise_id};"
    try:
        result = conn.get_db_cursor(query)
        canonical_solution = result[0]['canonical_solution'].strip().split()[-1]
        is_correct = (student_answer.strip() == canonical_solution)

        query = f"INSERT INTO attempts (user_id, exercise_id, student_answer, is_correct, hints_used) VALUES ({user_id}, {exercise_id}, '{student_answer}', {is_correct}, {hints_used});"
        try:
            conn.push_db_cursor(query)
        except Exception as e:
            print("Error inserting attempt data:", str(e))

        if not result:
            return jsonify({"error": "Exercise not found"}), 404
        
        update_mastery(user_id, concept_id)
        return jsonify({
            "is_correct": is_correct,
            "canonical_solution": canonical_solution,
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def ai_query(data):
    query = data.get("query", "")
    
    if not query:
        return {"error": "Query is required"}
    
    cache_response = conn.get_db_cursor("SELECT ai_response from ai_cache where user_query = %s;", (query,))
    if cache_response:
        return {
            "source": "cache",
            "data" : cache_response[0]["ai_response"]
        }
    
    ai_json = aiEngine.gen_ai_response(query)
    ai_response = {
        "source": "ai",
        "data": ai_json
    }

    try:
        safe_json = json.dumps(ai_json, ensure_ascii=False)
        conn.push_db_cursor("""
        INSERT INTO ai_cache (user_query, ai_response)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE ai_response = VALUES(ai_response)
        """, (query, safe_json))
    except Exception as e:
        print("Error caching AI response:", str(e))

    return ai_response

@main.route("/query-router", methods=["POST"])
@token_required
def query_router():
    # Protected AI query endpoint - requires Bearer token
    user_query = request.json
    # attach user_id to data for auditing/caching if needed
    if isinstance(user_query, dict):
        user_query['user_id'] = getattr(g, 'user_id', None)
    resolved_solution = ai_query(user_query)
    return jsonify({"resolved_solution": resolved_solution})


@main.route('/api/submit-answers', methods=['POST'])
@token_required
def submit_answers_route():
    data = request.json or {}
    # set user_id from token if not provided
    if not data.get('user_id'):
        data['user_id'] = getattr(g, 'user_id', None)
    return submit_answers(data)
