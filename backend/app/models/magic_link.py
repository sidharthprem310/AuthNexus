from datetime import datetime, timedelta
from app import db, bcrypt
import secrets

class MagicLink(db.Model):
    __tablename__ = 'magic_links'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    token_hash = db.Column(db.String(128), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('magic_links', lazy=True))

    def set_token(self, token):
        self.token_hash = bcrypt.generate_password_hash(token).decode('utf-8')

    def check_token(self, token):
        return bcrypt.check_password_hash(self.token_hash, token)

    @staticmethod
    def generate_token():
        return secrets.token_urlsafe(32)
