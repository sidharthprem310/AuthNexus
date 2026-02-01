from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.auth import bp
from app.models.audit_log import AuditLog
from app.models.user import User

@bp.route('/admin/audit-logs', methods=['GET'])
@jwt_required()
def get_all_audit_logs():
    """
    Get All Audit Logs (Admin Only)
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    # Pagination
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
