from flask import Flask
from config import config
from flask_cors import CORS
import os

config_name = "default"
# Set static_folder to the parent directory's static folder
static_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')
app = Flask(__name__, static_folder=static_folder)
app.config.from_object(config[config_name])

# CORS configuration - More permissive for development
cors_env = os.environ.get('CORS_ALLOWED_ORIGINS')
cors_host_ip = os.environ.get('CORS_HOST_IP')

if cors_env:
	origins = [o.strip() for o in cors_env.split(',') if o.strip()]
else:
	origins = [
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:5000",
		"http://127.0.0.1:5000",
		"http://localhost",
		"http://127.0.0.1",
	]

if cors_host_ip:
	origins.append(f"http://{cors_host_ip}:3000")
	origins.append(f"http://{cors_host_ip}:5000")

# Enable CORS with proper configuration
CORS(app, 
     resources={r"/*": {"origins": origins}}, 
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

from app.routes import main
from app.auth import auth

app.register_blueprint(main)
app.register_blueprint(auth)
