from datetime import datetime
from app import db
from app.models.audit_log import AuditLog

def send_security_alert(user, event_type, details=None):
    """
    Logs a security alert and simulates sending an email/notification.
    In a real system, this would trigger an SMTP email or SMS.
    """
    
    alert_msg = f"SECURITY ALERT for {user.email}: {event_type}"
    if details:
        alert_msg += f" - {details}"
        
    print(f"========================================")
    print(f"⚠️  {alert_msg}")
    print(f"========================================")
    
    # Log as an Audit Log but with a special 'ALERT' prefix or similar, 
    # or just rely on the event_name being distinct.
    
    log = AuditLog(
        user_id=user.id,
        event_name=f"ALERT_{event_type}",
        details=details or "High Priority Security Event",
        ip_address="SYSTEM"
    )
    db.session.add(log)
    db.session.commit()
