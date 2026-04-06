from flask import Blueprint, request, jsonify, current_app
from app.db_connect import DBConnection
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from flask import g
from app.jwt_utils import token_required

auth = Blueprint('auth', __name__)

@auth.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    # mark the token as revoked in token_history
    auth_header = request.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1].strip()

    if not token:
        return jsonify({'error': 'Token required for logout'}), 400

    try:
        conn = DBConnection(current_app.config)
        conn.push_db_cursor('UPDATE token_history SET revoked = TRUE WHERE token = %s', (token,))
    except Exception as e:
        print('Warning: failed to revoke token', e)

    return jsonify({'status': 'ok'}), 200


@auth.route('/api/auth/tokens', methods=['GET'])
@token_required
def list_tokens():
    # return token history for current user (non-sensitive fields)
    user_id = getattr(g, 'user_id', None)
    if not user_id:
        return jsonify({'error': 'user not identified'}), 401

    conn = DBConnection(current_app.config)
    try:
        rows = conn.get_db_cursor('SELECT id, user_agent, ip_address, issued_at, revoked FROM token_history WHERE user_id = %s ORDER BY issued_at DESC', (user_id,))
        return jsonify({'tokens': rows}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    print('Register data:', data)  # Debug log
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400

    conn = DBConnection(current_app.config)
    # Check if user exists
    exists = conn.get_db_cursor('SELECT id FROM users WHERE email = %s', (email,))
    if exists:
        return jsonify({'error': 'user already exists'}), 400
    try:
        password_hash = generate_password_hash(password)
    except Exception as e:
        return jsonify({'error': 'password hashing failed', "data":{"error": e}}), 500

    try:
        conn.push_db_cursor('INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s)', (email, password_hash, name))
    except Exception as e:
        return jsonify({'DB error': str(e), "data":{"error": e}}), 500

    return jsonify({'status': 'ok'}), 201


@auth.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    print('Login data:', data)  # Debug log
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'email and password required'}), 400

    conn = DBConnection(current_app.config)
    user = conn.get_db_cursor('SELECT id, password_hash FROM users WHERE email = %s', (email,))
    if not user:
        return jsonify({'error': 'invalid credentials'}), 401

    user = user[0]
    if not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'invalid credentials'}), 401

    payload = {
        'sub': str(user['id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, current_app.config.get('SECRET_KEY', 'MSpH4YN9VC94SGCjiGKKu2nD1TSwKP-aYy0YixJACAkeKfTGbQ_jkg'), algorithm='HS256')

    # Persist token and metadata to token_history for auditing
    try:
        user_agent = request.headers.get('User-Agent', '')
        ip_addr = request.remote_addr or request.environ.get('HTTP_X_FORWARDED_FOR')
        conn.push_db_cursor(
            'INSERT INTO token_history (user_id, token, user_agent, ip_address) VALUES (%s, %s, %s, %s)',
            (user['id'], token, user_agent, ip_addr)
        )
    except Exception as e:
        # Log but don't fail login on DB token insert error
        print('Warning: failed to write token_history', e)

    return jsonify({'token': token}), 200
