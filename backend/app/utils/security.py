import os
import uuid
from datetime import datetime, timedelta
import hashlib
import hmac
import base64
import jwt
from passlib.hash import bcrypt
from flask import current_app

def hash_password(password: str) -> str:
    return bcrypt.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.verify(password, hashed)

def create_access_token(user_id: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=current_app.config.get("ACCESS_TOKEN_EXPIRES_MINUTES",15))).timestamp())
    }
    token = jwt.encode(payload, current_app.config.get("JWT_SECRET", current_app.config.get("SECRET_KEY")), algorithm="HS256")
    # PyJWT >=2 returns str
    return token

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, current_app.config.get("JWT_SECRET", current_app.config.get("SECRET_KEY")), algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise
    except Exception:
        raise

def generate_refresh_token() -> str:
    # generate a random token (url-safe)
    return base64.urlsafe_b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes).decode().rstrip("=")

def hash_token(token: str) -> str:
    # use HMAC-SHA256 with secret to hash refresh tokens before storing
    secret = current_app.config.get("JWT_SECRET", current_app.config.get("SECRET_KEY", "change-me"))
    return hmac.new(secret.encode(), token.encode(), hashlib.sha256).hexdigest()

