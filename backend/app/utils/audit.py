from app import db
from app.models.audit_log import AuditLog
from flask import request

def log_audit_event(event_name, user_id=None, details=None):
    ip_address = request.remote_addr if request else None
    
    # Auto-append device info to details
    ua = request.user_agent.string if request and request.user_agent else "Unknown"
    
    if details:
        details = f"{details} | Device: {ua}"
    else:
        details = f"Device: {ua}"
    
    log = AuditLog(
        user_id=user_id,
        event_name=event_name,
        ip_address=ip_address,
        details=details
    )
    db.session.add(log)
    db.session.commit()
