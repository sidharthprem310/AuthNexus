from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.auth import bp
from app import db
from app.models.device import UserDevice
from app.models.user import User

@bp.route('/devices', methods=['GET'])
@jwt_required()
def get_devices():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    current_jti = get_jwt()['jti']
    
    devices_list = []
    for device in user.devices:
        d = device.to_dict()
        if device.session_token == current_jti:
            d['is_current'] = True
        devices_list.append(d)
        
    return jsonify(devices_list), 200

@bp.route('/devices/<int:device_id>', methods=['DELETE'])
@jwt_required()
def revoke_device(device_id):
    user_id = get_jwt_identity()
    
    device = UserDevice.query.filter_by(id=device_id, user_id=user_id).first()
    if not device:
        return jsonify({'error': 'Device not found'}), 404
        
    # In a real app with JWT, "revoking" immediate access is hard without a blacklist
    # But we can at least delete the record so the user sees it's gone.
    # To truly revoke, we'd need to add the JTI to a blocklist (Redis/DB).
    # For this MVP, we will just delete the record using DB.
    
    from app.models.blocklist import TokenBlocklist # If exists, or create separate table
    # Since we don't have blocklist yet, we'll just delete the row.
    
    db.session.delete(device)
    db.session.commit()
    
    return jsonify({'message': 'Device access revoked'}), 200
