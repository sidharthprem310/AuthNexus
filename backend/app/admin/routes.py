from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.blocklist import BlockedIP
from app.models.device import UserDevice
from app import db

bp = Blueprint('admin', __name__)

# Basic Admin Decorator (mock logic for now, or check explicit 'is_admin' field)
from functools import wraps

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # In a real app, check User.role == 'admin'
        # For this MVP, let's hardcode a specific email or just allow any auth user for demo 
        # (BUT warn the user).
        # Better: let's assume the first registered user is admin, or check a list.
        # Let's check if email contains 'admin' for demo purposes.
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or 'admin' not in user.email.lower():  # Simple rule for demo
             return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_stats():
    user_count = User.query.count()
    mfa_enabled_count = User.query.filter_by(is_mfa_enabled=True).count()
    blocked_ips_count = BlockedIP.query.count()
    
    # Recent alerts (Audit logs starting with ALERT_)
    recent_alerts = AuditLog.query.filter(AuditLog.event_name.like('ALERT_%')).order_by(AuditLog.timestamp.desc()).limit(10).all()
    
    return jsonify({
        'users': {
            'total': user_count,
            'mfa_enabled': mfa_enabled_count
        },
        'security': {
            'blocked_ips': blocked_ips_count
        },
        'recent_alerts': [log.to_dict() for log in recent_alerts]
    }), 200

@bp.route('/block-ip', methods=['POST'])
@jwt_required()
@admin_required
def block_ip():
    data = request.get_json()
    ip = data.get('ip')
    reason = data.get('reason', 'Manual Ban')
    
    if not ip:
        return jsonify({'error': 'IP required'}), 400
        
    # Check if already blocked
    if BlockedIP.query.filter_by(ip_address=ip).first():
        return jsonify({'message': 'IP already blocked'}), 200
        
    blocked = BlockedIP(ip_address=ip, reason=reason)
    db.session.add(blocked)
    db.session.commit()
    
    return jsonify({'message': f'IP {ip} blocked successfully'}), 200
