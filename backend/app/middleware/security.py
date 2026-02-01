from flask import request, abort, jsonify
from app.models.blocklist import BlockedIP
import logging

def check_ip_ban():
    # skip for static files or specific routes if needed
    if request.endpoint and 'static' in request.endpoint:
        return

    ip = request.remote_addr
    
    # Check if IP is in blocklist
    # Optimization: Cache this in Redis in production
    blocked = BlockedIP.query.filter_by(ip_address=ip).first()
    
    if blocked and blocked.is_active():
        logging.warning(f"Blocked request from {ip}: {blocked.reason}")
        abort(403, description="Access to this resource is forbidden.")
