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
    # Point static folder to the react build output
    import os
    app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='/')
    app.config.from_object(config_class)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return app.send_static_file(path)
        return app.send_static_file('index.html')

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    swagger.init_app(app)

    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.mfa import bp as mfa_bp
    app.register_blueprint(mfa_bp, url_prefix='/mfa')

    from app.oauth import bp as oauth_bp
    app.register_blueprint(oauth_bp, url_prefix='/oauth')

    # Ensure models are imported
    from app.models.user import User
    from app.models.recovery_code import RecoveryCode
    from app.models.audit_log import AuditLog
    from app.models.oauth import OAuthClient, OAuthAuthCode

    return app
