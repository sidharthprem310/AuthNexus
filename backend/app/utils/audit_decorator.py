from functools import wraps
from flask import request, g
from app.utils.audit import log_audit_event
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

def audit_action(event_name, details=None):
    """
    Decorator to automatically log an audit event for a route.
    Usage: @audit_action('my_action', details='Optional details')
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Attempt to identify user if possible
            user_id = None
            try:
                verify_jwt_in_request(optional=True)
                user_id = get_jwt_identity()
            except:
                pass

            # Execute the function
            try:
                response = f(*args, **kwargs)
                
                # Check status code if response is a tuple or Response object
                status_code = 200
                if isinstance(response, tuple):
                    status_code = response[1]
                elif hasattr(response, 'status_code'):
                    status_code = response.status_code
                    
                # Log success or failure based on status code
                log_details = details if details else f"Accessed {request.path}"
                if status_code >= 400:
                    log_audit_event(f"{event_name}_failed", user_id, f"{log_details} | Status: {status_code}")
                else:
                    log_audit_event(f"{event_name}_success", user_id, log_details)
                    
                return response
            except Exception as e:
                # Log exception
                log_audit_event(f"{event_name}_error", user_id, f"{details or request.path} | Error: {str(e)}")
                raise e
                
        return wrapper
    return decorator
