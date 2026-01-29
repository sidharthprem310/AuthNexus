import uuid
from datetime import datetime
from app import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_locked = db.Column(db.Boolean, default=False)
    mfa_secret = db.Column(db.String(32), nullable=True)
    is_mfa_enabled = db.Column(db.Boolean, default=False)
    
    # Email OTP fields
    email_otp_hash = db.Column(db.String(128), nullable=True)
    email_otp_expires_at = db.Column(db.DateTime, nullable=True)

    # Lockout fields
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_failed_login = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recovery_codes = db.relationship('RecoveryCode', back_populates='user', lazy=True)
    devices = db.relationship('UserDevice', back_populates='user', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def get_totp_uri(self):
        import pyotp
        return pyotp.totp.TOTP(self.mfa_secret).provisioning_uri(name=self.email, issuer_name='AuthNexus')

    def verify_totp(self, token):
        import pyotp
        return pyotp.TOTP(self.mfa_secret).verify(token)

    def set_email_otp(self, otp):
        self.email_otp_hash = bcrypt.generate_password_hash(otp).decode('utf-8')

    def check_email_otp(self, otp):
        return bcrypt.check_password_hash(self.email_otp_hash, otp)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_active': self.is_active,
            'is_locked': self.is_locked,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
