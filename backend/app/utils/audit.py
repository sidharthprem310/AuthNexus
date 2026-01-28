from app import db
from app.models.audit_log import AuditLog
from flask import request

def log_audit_event(event_name, user_id=None, details=None):
    ip_address = request.remote_addr if request else None
    
    log = AuditLog(
        user_id=user_id,
        event_name=event_name,
        ip_address=ip_address,
        details=details
    )
    db.session.add(log)
    db.session.commit()
