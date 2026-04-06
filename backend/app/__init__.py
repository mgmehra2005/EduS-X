from flask import Flask
from config import config
from flask_cors import CORS
import os

config_name = "default"
app = Flask(__name__)
app.config.from_object(config[config_name])

# CORS configuration
# - You can set CORS_ALLOWED_ORIGINS as a comma-separated list of origins
#   or set CORS_HOST_IP to your local network IP (e.g. 192.168.1.164) and
#   this will add http://<IP>:3000 and http://<IP>:5000 to allowed origins.
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
	]

if cors_host_ip:
	origins.append(f"http://{cors_host_ip}:3000")
	origins.append(f"http://{cors_host_ip}:5000")
	# origins.append(f"http://192.168.1.42:3000")
	# origins.append(f"http://192.168.1.42:5000")

CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)

from app.routes import main
from app.auth import auth

app.register_blueprint(main)
app.register_blueprint(auth)
