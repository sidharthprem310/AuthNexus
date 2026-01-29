from datetime import datetime
from app import db

class UserDevice(db.Model):
    __tablename__ = 'user_devices'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    session_token = db.Column(db.String(255), unique=True, nullable=False) # JWT JTI or similar identifier
    device_name = db.Column(db.String(255), nullable=True) # e.g. "Chrome on Windows"
    ip_address = db.Column(db.String(45), nullable=True)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    is_trusted = db.Column(db.Boolean, default=False) # For "Remember Me"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='devices')

    def to_dict(self):
        return {
            'id': self.id,
            'device_name': self.device_name,
            'ip_address': self.ip_address,
            'last_active': self.last_active.isoformat(),
            'is_trusted': self.is_trusted,
            'is_current': False # Calculated field when returning list
        }
