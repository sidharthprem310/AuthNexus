from datetime import datetime, timedelta
from app import db, bcrypt
import secrets

class OAuthClient(db.Model):
    __tablename__ = 'oauth_clients'

    client_id = db.Column(db.String(48), primary_key=True)
    client_secret_hash = db.Column(db.String(128), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    client_name = db.Column(db.String(64), nullable=False)
    redirect_uris = db.Column(db.Text, nullable=False) # Comma separated
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_secret(self, secret):
        self.client_secret_hash = bcrypt.generate_password_hash(secret).decode('utf-8')

    def check_secret(self, secret):
        return bcrypt.check_password_hash(self.client_secret_hash, secret)

    def check_redirect_uri(self, uri):
        allowed_uris = [u.strip() for u in self.redirect_uris.split(',')]
        return uri in allowed_uris

class OAuthAuthCode(db.Model):
    __tablename__ = 'oauth_auth_codes'

    code = db.Column(db.String(48), primary_key=True)
    client_id = db.Column(db.String(48), db.ForeignKey('oauth_clients.client_id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    redirect_uri = db.Column(db.Text, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    scope = db.Column(db.Text, nullable=True) # Space separated

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    @staticmethod
    def generate_code():
        return secrets.token_urlsafe(32)
