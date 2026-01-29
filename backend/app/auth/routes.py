from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.auth import bp
from datetime import datetime
from app import db, limiter
from app.models.user import User
from app.utils.audit import log_audit_event
from email_validator import validate_email, EmailNotValidError

@bp.route('/register', methods=['POST'])
def register():
    """
    User Registration
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
            password:
              type: string
    responses:
      201:
        description: User registered successfully
      400:
        description: Invalid input
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        validate_email(email, check_deliverability=False)
    except EmailNotValidError:
        return jsonify({'error': 'Invalid email format'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    new_user = User(email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict()}), 201

@bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """
    User Login
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            email:
              type: string
            password:
              type: string
    responses:
      200:
        description: Login successful or MFA required
      401:
        description: Invalid credentials
      403:
        description: Account locked
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user:
        # Prevent timing attacks (conceptually) and just return error
        log_audit_event('login_failed', details=f"Email: {email} - User not found")
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check Lockout
    if user.is_locked:
        log_audit_event('login_locked', user_id=user.id, details="Attempted login while locked")
        return jsonify({'error': 'Account is locked'}), 403
        
    if user.failed_login_attempts >= 5:
        user.is_locked = True
        db.session.commit()
        log_audit_event('account_locked', user_id=user.id, details="Too many failed attempts")
        return jsonify({'error': 'Account is locked'}), 403

    if not user.check_password(password):
        user.failed_login_attempts += 1
        user.last_failed_login = datetime.utcnow()
        db.session.commit()
        log_audit_event('login_failed', user_id=user.id, details=f"Attempts: {user.failed_login_attempts}")
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403

    # Success
    user.failed_login_attempts = 0
    user.last_failed_login = None
    db.session.commit()
    log_audit_event('login_success', user_id=user.id)

    if user.is_mfa_enabled:
        # Create a temporary token for MFA verification
        # In a real app, this should have restricted permissions
        temp_token = create_access_token(identity=user.id, additional_claims={'is_pre_auth': True})
        return jsonify({'mfa_required': True, 'mfa_token': temp_token}), 200

    access_token = create_access_token(identity=user.id, additional_claims={'is_pre_auth': False})
    return jsonify({'access_token': access_token, 'user': user.to_dict()}), 200

@bp.route('/verify-2fa', methods=['POST'])
@jwt_required()
def verify_2fa():
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    if not claims.get('is_pre_auth'):
        return jsonify({'error': 'Invalid token type for coverage'}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    otp = data.get('otp')
    
    if not otp:
        return jsonify({'error': 'OTP required'}), 400
        
    if not user.verify_totp(otp):
        return jsonify({'error': 'Invalid OTP'}), 400
        
    # Success - Issue full token
    access_token = create_access_token(identity=user.id, additional_claims={'is_pre_auth': False})
    return jsonify({'access_token': access_token, 'user': user.to_dict()}), 200

@bp.route('/verify-recovery-code', methods=['POST'])
@jwt_required()
def verify_recovery_code():
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    if not claims.get('is_pre_auth'):
        return jsonify({'error': 'Invalid token type for coverage'}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    code = data.get('code')
    
    if not code:
        return jsonify({'error': 'Recovery code required'}), 400
        
    # Check against all unused codes for this user
    # Need to iterate because we only have hashes
    valid_code_found = None
    for rc in user.recovery_codes:
        if not rc.is_used and rc.check_code(code):
            valid_code_found = rc
            break
            
    if valid_code_found:
        valid_code_found.is_used = True
        db.session.commit()
        access_token = create_access_token(identity=user.id, additional_claims={'is_pre_auth': False})
        return jsonify({'access_token': access_token, 'user': user.to_dict()}), 200
        
    return jsonify({'error': 'Invalid or used recovery code'}), 400

@bp.route('/request-email-otp', methods=['POST'])
@jwt_required()
def request_email_otp():
    # Can be called with either pre-auth token (during login) or full auth token (e.g. updating settings)
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    import secrets
    from datetime import datetime, timedelta
    
    otp = str(secrets.randbelow(1000000)).zfill(6)
    user.set_email_otp(otp)
    user.email_otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()
    
    # In production, send via SMTP
    print(f"========================================")
    print(f"EMAIL OTP for {user.email}: {otp}")
    print(f"========================================")
    
    return jsonify({'message': 'Email OTP sent (check server logs)'}), 200

@bp.route('/verify-email-otp', methods=['POST'])
@jwt_required()
def verify_email_otp():
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    # Check if pre_auth or full, but for login fallback it's usually pre_auth
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    otp = data.get('otp')
    
    if not otp:
        return jsonify({'error': 'OTP required'}), 400
        
    from datetime import datetime
    if not user.email_otp_hash or not user.email_otp_expires_at or datetime.utcnow() > user.email_otp_expires_at:
        return jsonify({'error': 'Invalid or expired OTP'}), 400
        
    if user.check_email_otp(otp):
        # Clear OTP
        user.email_otp_hash = None
        user.email_otp_expires_at = None
        db.session.commit()
        
        access_token = create_access_token(identity=user.id, additional_claims={'is_pre_auth': False})
        return jsonify({'access_token': access_token, 'user': user.to_dict()}), 200
        
    return jsonify({'error': 'Invalid OTP'}), 400

@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    
    # Always return success to prevent email enumeration
    if not user:
        return jsonify({'message': 'If an account exists, a reset link has been sent.'}), 200
    
    from flask_jwt_extended import create_access_token
    from datetime import timedelta
    
    # Create reset token (expires in 15 mins)
    reset_token = create_access_token(identity=user.id, additional_claims={'type': 'reset'}, expires_delta=timedelta(minutes=15))
    
    # Construct reset link (Client-side route)
    # Using request.host_url implies backend URL, but we need Frontend URL.
    # In Monolith mode, they are the same.
    reset_link = f"{request.host_url.rstrip('/')}/create-password?token={reset_token}" 

    # Simulate Email Sending
    print(f"========================================")
    print(f"PASSWORD RESET LINK for {email}: {reset_link}")
    print(f"========================================")
    
    return jsonify({'message': 'If an account exists, a reset link has been sent.'}), 200

@bp.route('/reset-password', methods=['POST'])
@jwt_required()
def reset_password():
    from flask_jwt_extended import get_jwt, get_jwt_identity
    
    claims = get_jwt()
    if claims.get('type') != 'reset':
         return jsonify({'error': 'Invalid token type for password reset'}), 400
         
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    new_password = data.get('password')
    
    if not new_password:
        return jsonify({'error': 'Password required'}), 400
        
    user.set_password(new_password)
    # Clear lockout counters if any
    user.failed_login_attempts = 0
    user.is_locked = False
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'}), 200

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get Current User Details
    ---
    tags:
      - Auth
    security:
      - Bearer: []
    responses:
      200:
        description: Current user profile
      401:
        description: Unauthorized
    """
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify(user.to_dict()), 200

@bp.route('/account', methods=['PUT'])
@jwt_required()
def update_account():
    """Update User Profile (Email/Username)"""
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    new_email = data.get('email')
    
    if not new_email:
        return jsonify({'error': 'Email is required'}), 400
        
    if user.email == new_email:
        return jsonify({'message': 'No changes made'}), 200
        
    # Check uniqueness
    if User.query.filter_by(email=new_email).first():
        return jsonify({'error': 'Email already taken'}), 409
        
    user.email = new_email
    db.session.commit()
    
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200

@bp.route('/security', methods=['PUT'])
@jwt_required()
def update_security():
    """Update Password"""
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password required'}), 400
        
    if not user.check_password(current_password):
        return jsonify({'error': 'Incorrect current password'}), 401
        
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'}), 200
