from functools import wraps
from flask import request, jsonify, current_app, g
import jwt


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', None)
        if auth_header and auth_header.startswith('Bearer '):
            token = str(auth_header.split(' ', 1)[1].strip())

        if not token:
            return jsonify({'error': 'Token is missing', 'auth': auth_header}), 401

        try:
            try:
                payload = jwt.decode(token, current_app.config.get('SECRET_KEY', 'MSpH4YN9VC94SGCjiGKKu2nD1TSwKP-aYy0YixJACAkeKfTGbQ_jkg'), algorithms=['HS256'])
            except Exception as e:
                return jsonify({'error': 'Token decoding failed', 'details': str(e), 'token': token}), 401
            # put user id into flask.g for downstream usage
            g.user_id = payload.get('sub')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except Exception as e:
            return jsonify({'error': 'Token is invalid', 'details': str(e)}), 401

        return f(*args, **kwargs)

    return decorated
