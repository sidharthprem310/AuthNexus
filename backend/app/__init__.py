from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flasgger import Swagger
from config import Config

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)
swagger = Swagger()

def create_app(config_class=Config):
    # Use default static_folder ('static') which is 'backend/app/static'
    app = Flask(__name__, static_url_path='/')
    app.config.from_object(config_class)

    # Ensure correct MIME types (critical for Docker/Slim images)
    import mimetypes
    mimetypes.add_type('application/javascript', '.js')
    mimetypes.add_type('text/css', '.css')

    @app.errorhandler(404)
    def not_found(e):
        from flask import send_from_directory
        return send_from_directory(app.static_folder, 'index.html')

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    swagger.init_app(app)

    @app.route('/debug-files')
    def debug_files():
        import os
        debug_info = {
            "static_folder": app.static_folder,
            "root_path": app.root_path,
            "cwd": os.getcwd(),
            "static_files": [],
            "root_files": []
        }
        try:
            debug_info["static_files"] = os.listdir(app.static_folder)
        except Exception as e:
            debug_info["static_files"] = str(e)
            
        try:
            debug_info["root_files"] = os.listdir(app.root_path)
        except Exception as e:
            debug_info["root_files"] = str(e)
            
        return debug_info

    
    # Import routes to register them with blueprints
    from app.auth import bp as auth_bp
    # Import sub-modules that define routes inside the blueprint
    from app.auth import device_routes
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.admin.routes import bp as admin_bp
    app.register_blueprint(admin_bp, url_prefix='/admin')

    from app.mfa import bp as mfa_bp
    app.register_blueprint(mfa_bp, url_prefix='/mfa')

    from app.oauth import bp as oauth_bp
    app.register_blueprint(oauth_bp, url_prefix='/oauth')

    # Ensure models are imported
    from app.models.user import User
    from app.models.recovery_code import RecoveryCode
    from app.models.audit_log import AuditLog
    from app.models.device import UserDevice
    from app.models.magic_link import MagicLink
    from app.models.blocklist import BlockedIP
    from app.models.oauth import OAuthClient, OAuthAuthCode

    # Register Middleware
    from app.middleware.security import check_ip_ban
    app.before_request(check_ip_ban)

    return app
