from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.blocklist import BlockedIP
from app.models.device import UserDevice
from app.utils.audit import log_audit_event
from app.utils.alerts import send_security_alert
from app import db
from functools import wraps

bp = Blueprint('admin', __name__)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or not user.is_admin:
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
    
    # Recent alerts
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

@bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@admin_required
def get_all_audit_logs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = AuditLog.query.order_by(AuditLog.timestamp.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    logs = [log.to_dict() for log in pagination.items]
    
    return jsonify({
        'logs': logs,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/blocked-ips', methods=['GET'])
@jwt_required()
@admin_required
def get_blocked_ips():
    blocked = BlockedIP.query.order_by(BlockedIP.blocked_at.desc()).all()
    return jsonify([{
        'id': b.id,
        'ip_address': b.ip_address,
        'reason': b.reason,
        'blocked_at': b.blocked_at.isoformat(),
        'expires_at': b.expires_at.isoformat() if b.expires_at else None
    } for b in blocked]), 200

@bp.route('/block-ip', methods=['POST'])
@jwt_required()
@admin_required
def block_ip():
    data = request.get_json()
    ip = data.get('ip')
    reason = data.get('reason', 'Manual Ban')
    
    if not ip:
        return jsonify({'error': 'IP required'}), 400
        
    if BlockedIP.query.filter_by(ip_address=ip).first():
        return jsonify({'message': 'IP already blocked'}), 200
        
    blocked = BlockedIP(ip_address=ip, reason=reason)
    db.session.add(blocked)
    db.session.commit()
    
    return jsonify({'message': f'IP {ip} blocked successfully'}), 200

@bp.route('/blocked-ips/<ip>', methods=['DELETE'])
@jwt_required()
@admin_required
def unblock_ip(ip):
    blocked = BlockedIP.query.filter_by(ip_address=ip).first()
    if not blocked:
        return jsonify({'error': 'IP not found'}), 404
        
    db.session.delete(blocked)
    db.session.commit()
    
    return jsonify({'message': f'IP {ip} unblocked successfully'}), 200

@bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def list_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = User.query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    users = [user.to_dict() for user in pagination.items]
    
    return jsonify({
        'users': users,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@bp.route('/users/<user_id>/lock', methods=['POST'])
@jwt_required()
@admin_required
def lock_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user.is_locked = True
    db.session.commit()
    
    log_audit_event('admin_lock_user', user_id=user.id, details=f"Locked by admin")
    
    return jsonify({'message': f'User {user.email} locked successfully'}), 200

@bp.route('/users/<user_id>/unlock', methods=['POST'])
@jwt_required()
@admin_required
def unlock_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user.is_locked = False
    user.failed_login_attempts = 0 # Reset counters
    db.session.commit()
    
    log_audit_event('admin_unlock_user', user_id=user.id, details=f"Unlocked by admin")
    
    return jsonify({'message': f'User {user.email} unlocked successfully'}), 200
