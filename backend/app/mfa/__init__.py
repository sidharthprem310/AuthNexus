from flask import Blueprint

bp = Blueprint('mfa', __name__)

from app.mfa import routes
