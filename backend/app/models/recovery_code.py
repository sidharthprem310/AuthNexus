from datetime import datetime
from app import db, bcrypt

class RecoveryCode(db.Model):
    __tablename__ = 'recovery_codes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    code_hash = db.Column(db.String(128), nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='recovery_codes')

    def set_code(self, code):
        self.code_hash = bcrypt.generate_password_hash(code).decode('utf-8')

    def check_code(self, code):
        return bcrypt.check_password_hash(self.code_hash, code)
