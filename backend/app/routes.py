from flask import Blueprint, jsonify, request, json, g, send_from_directory, Response
from app import app
from app.db_connect import DBConnection
from app.eduba_engine import update_mastery, EdubaAIEngine
from app.jwt_utils import token_required
import os

main = Blueprint("main", __name__)
conn = DBConnection(app.config)
aiEngine = EdubaAIEngine()

# SVG placeholder logo
SVG_LOGO = '''<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#007bff"/>
  <text x="50" y="60" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">E</text>
</svg>'''

# Serve static files (logo, images, etc.)
@main.route("/static/<path:filename>")
def serve_static(filename):
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')
    try:
        return send_from_directory(static_dir, filename)
    except FileNotFoundError:
        # Return a placeholder SVG logo for PNG requests
        if filename.endswith('.png'):
            return Response(SVG_LOGO, mimetype='image/svg+xml')
        return jsonify({"error": "File not found"}), 404

# Health check endpoint
@main.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# -----------------------API Routes-----------------------

# -----------------------API Routes-----------------------

@main.route("/api/exercises", methods=["GET"])
@token_required
def get_exercises():
    concept_id = request.args.get("concept_id")
    if not concept_id:
        return jsonify({"error": "Invalid concept id"}), 400
    
    query = f'select exercise_id, problem_text, difficulty_level from exercise where concept_id = %s;'
    try:
        result = conn.get_db_cursor(query, (concept_id,))
        if result:
            return jsonify({"exercises": result}), 200
        else:
            return jsonify({"error": "No exercises found for the given concept_id"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@main.route("/api/submit-answers", methods=["POST"])
@token_required
def submit_answers_route():
    data = request.json or {}
    user_id = data.get("user_id") or getattr(g, 'user_id', None)
    exercise_id = data.get("exercise_id")
    student_answer = data.get("student_answer")
    hints_used = data.get("hints_used", 0)

    if not user_id or not exercise_id or student_answer is None:
        return jsonify({"error": "user_id, exercise_id, and student_answer are required"}), 400

    concept_id_query = "SELECT concept_id FROM exercise WHERE exercise_id = %s;"
    try:
        concept_result = conn.get_db_cursor(concept_id_query, (exercise_id,))
        if not concept_result:
            return jsonify({"error": "Invalid exercise_id"}), 404
        concept_id = concept_result[0]['concept_id']
    except Exception as e:
        return jsonify({"error": "Error fetching concept_id: " + str(e)}), 400

    query = "SELECT canonical_solution FROM exercise WHERE exercise_id = %s;"
    try:
        result = conn.get_db_cursor(query, (exercise_id,))
        if not result:
            return jsonify({"error": "Exercise not found"}), 404
            
        canonical_solution = result[0]['canonical_solution'].strip().split()[-1]
        is_correct = (student_answer.strip() == canonical_solution)

        insert_query = "INSERT INTO attempts (user_id, exercise_id, student_answer, is_correct, hints_used) VALUES (%s, %s, %s, %s, %s);"
        try:
            conn.push_db_cursor(insert_query, (user_id, exercise_id, student_answer, is_correct, hints_used))
        except Exception as e:
            print("Error inserting attempt data:", str(e))
        
        update_mastery(user_id, concept_id)
        return jsonify({
            "is_correct": is_correct,
            "canonical_solution": canonical_solution,
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@main.route("/api/query", methods=["POST"])
@token_required
def query_endpoint():
    data = request.json or {}
    user_query = data.get("query", "")
    
    if not user_query:
        return jsonify({"error": "Query is required"}), 400
    
    try:
        # Check cache first
        cache_response = conn.get_db_cursor("SELECT ai_response from ai_cache where user_query = %s;", (user_query,))
        if cache_response:
            return jsonify({
                "source": "cache",
                "data": cache_response[0]["ai_response"]
            }), 200
        
        # Generate AI response
        ai_json = aiEngine.gen_ai_response(user_query)
        
        # Try to cache it
        try:
            safe_json = json.dumps(ai_json, ensure_ascii=False)
            conn.push_db_cursor("""
            INSERT INTO ai_cache (user_query, ai_response)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE ai_response = VALUES(ai_response)
            """, (user_query, safe_json))
        except Exception as e:
            print("Error caching AI response:", str(e))
        
        return jsonify({
            "source": "ai",
            "data": ai_json
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Alias for backward compatibility
@main.route("/query-router", methods=["POST"])
@token_required
def query_router():
    return query_endpoint()
