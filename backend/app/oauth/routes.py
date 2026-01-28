from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from app.oauth import bp
from app import db
from app.models.user import User
from app.models.oauth import OAuthClient, OAuthAuthCode
import secrets
from datetime import datetime, timedelta

@bp.route('/clients', methods=['POST'])
@jwt_required()
def register_client():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    client_name = data.get('client_name')
    redirect_uris = data.get('redirect_uris')
    
    if not client_name or not redirect_uris:
        return jsonify({'error': 'Client name and redirect URIs required'}), 400
        
    client_id = secrets.token_urlsafe(24)
    client_secret = secrets.token_urlsafe(32)
    
    client = OAuthClient(
        client_id=client_id,
        user_id=user_id,
        client_name=client_name,
        redirect_uris=redirect_uris
    )
    client.set_secret(client_secret)
    db.session.add(client)
    db.session.commit()
    
    return jsonify({
        'message': 'Client registered successfully',
        'client_id': client_id,
        'client_secret': client_secret
    }), 201

@bp.route('/authorize', methods=['GET'])
@jwt_required()
def authorize_prompt():
    # Only validates GET params and returns info for consent screen
    # User session check handled by @jwt_required
    
    client_id = request.args.get('client_id')
    redirect_uri = request.args.get('redirect_uri')
    response_type = request.args.get('response_type')
    scope = request.args.get('scope', 'default')
    
    if response_type != 'code':
        return jsonify({'error': 'Unsupported response_type'}), 400
        
    client = OAuthClient.query.get(client_id)
    if not client:
        return jsonify({'error': 'Invalid client_id'}), 400
        
    if not client.check_redirect_uri(redirect_uri):
        return jsonify({'error': 'Invalid redirect_uri'}), 400
        
    # Return info for Frontend to render consent screen
    return jsonify({
        'client_name': client.client_name,
        'scope': scope,
        'redirect_uri': redirect_uri
    }), 200

@bp.route('/authorize', methods=['POST'])
@jwt_required()
def authorize_confirm():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Check MFA enforce - we assume if they are here with a valid token, they are authed.
    # But if we were doing session-based cookies, we'd check session['mfa_verified'].
    # With JWT as configured in Phase 2, if they have a full access token (not pre_auth), they are MFA verified.
    
    data = request.get_json()
    client_id = data.get('client_id')
    redirect_uri = data.get('redirect_uri')
    consent = data.get('consent')
    scope = data.get('scope', 'default')
    
    if consent != 'allow':
        return jsonify({'error': 'Access denied'}), 403
        
    client = OAuthClient.query.get(client_id)
    if not client or not client.check_redirect_uri(redirect_uri):
        return jsonify({'error': 'Invalid client parameters'}), 400
        
    code = OAuthAuthCode.generate_code()
    auth_code = OAuthAuthCode(
        code=code,
        client_id=client_id,
        user_id=user_id,
        redirect_uri=redirect_uri,
        scope=scope,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.session.add(auth_code)
    db.session.commit()
    
    return jsonify({
        'redirect_uri': f"{redirect_uri}?code={code}"
    }), 200

@bp.route('/token', methods=['POST'])
def token_exchange():
    data = request.get_json()
    grant_type = data.get('grant_type')
    code = data.get('code')
    redirect_uri = data.get('redirect_uri')
    client_id = data.get('client_id')
    client_secret = data.get('client_secret')
    
    if grant_type != 'authorization_code':
        return jsonify({'error': 'Unsupported grant_type'}), 400
        
    client = OAuthClient.query.get(client_id)
    if not client or not client.check_secret(client_secret):
        return jsonify({'error': 'Invalid client credentials'}), 401
        
    auth_code = OAuthAuthCode.query.get(code)
    if not auth_code:
        return jsonify({'error': 'Invalid code'}), 400
        
    if auth_code.is_used:
        # RFC says revoke all tokens if used code is presented.
        # For now, just error.
        return jsonify({'error': 'Code already used'}), 400
        
    if auth_code.is_expired():
        return jsonify({'error': 'Code expired'}), 400
        
    if auth_code.client_id != client_id or auth_code.redirect_uri != redirect_uri:
        return jsonify({'error': 'Code does not match request'}), 400
        
    # Valid
    auth_code.is_used = True
    db.session.commit()
    
    # Issue Access Token for User
    # In a real oauth system, this would be an access token bound to the scope/client.
    # Here we issue a standard user access token for demo.
    access_token = create_access_token(
        identity=auth_code.user_id,
        additional_claims={
            'client_id': client_id,
            'scope': auth_code.scope
        }
    )
    
    return jsonify({
        'access_token': access_token,
        'token_type': 'Bearer',
        'expires_in': 3600
    }), 200
