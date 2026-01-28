from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.mfa import bp
from app import db
from app.models.user import User
from app.models.recovery_code import RecoveryCode
import pyotp

@bp.route('/setup', methods=['POST'])
@jwt_required()
def setup_mfa():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    secret = pyotp.random_base32()
    # In a real app, save this temporarily or just send it back. 
    # Here we'll rely on the user sending it back to confirm, 
    # or better, we can't save it to the user yet until verified.
    # But for simplicity, we return it. 
    # Actually, standard flow: generate secret, return to user (QR), user scans, enters code.
    # We need to verify code + secret to enable.
    
    uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name='AuthNexus')
    
    return jsonify({
        'secret': secret,
        'provisioning_uri': uri
    }), 200

@bp.route('/enable', methods=['POST'])
@jwt_required()
def enable_mfa():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    secret = data.get('secret')
    otp = data.get('otp')

    if not secret or not otp:
        return jsonify({'error': 'Secret and OTP required'}), 400

    totp = pyotp.TOTP(secret)
    if not totp.verify(otp):
        return jsonify({'error': 'Invalid OTP'}), 400

    user.mfa_secret = secret
    user.is_mfa_enabled = True
    db.session.commit()

    return jsonify({'message': 'MFA enabled successfully'}), 200

@bp.route('/disable', methods=['POST'])
@jwt_required()
def disable_mfa():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Ideally require password confirmation here
    data = request.get_json()
    password = data.get('password')
    
    if not user.check_password(password):
        return jsonify({'error': 'Invalid password'}), 401

    user.mfa_secret = None
    user.is_mfa_enabled = False
    db.session.commit()

    return jsonify({'message': 'MFA disabled successfully'}), 200

@bp.route('/recovery-codes', methods=['POST'])
@jwt_required()
def generate_recovery_codes():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user.is_mfa_enabled:
        return jsonify({'error': 'MFA must be enabled to generate recovery codes'}), 400

    # Clear existing codes
    # Clear existing codes
    RecoveryCode.query.filter_by(user_id=user.id).delete()
    
    codes = []
    plain_codes = []
    
    import secrets
    for _ in range(10):
        code = secrets.token_hex(5) # 10 chars
        plain_codes.append(code)
        
        rc = RecoveryCode(user_id=user.id)
        rc.set_code(code)
        db.session.add(rc)
        
    db.session.commit()
    
    return jsonify({
        'message': 'Recovery codes generated. Save them safely.',
        'codes': plain_codes
    }), 200
