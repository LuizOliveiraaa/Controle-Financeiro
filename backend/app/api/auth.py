from flask import Blueprint, request, jsonify, current_app, make_response
from app.extensions import db
from app.models.user import User
from app.models.token import RefreshToken
from app.utils.security import hash_password, verify_password, create_access_token, generate_refresh_token, hash_token
from datetime import datetime, timedelta

bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    nome = data.get("nome")
    if not email or not password:
        return jsonify({"error": "email and password required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already in use"}), 409
    user = User(email=email, senha_hash=hash_password(password), nome=nome)
    db.session.add(user)
    db.session.commit()
    return jsonify({"user": user.to_dict()}), 201

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "email and password required"}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.senha_hash or not verify_password(password, user.senha_hash):
        return jsonify({"error": "invalid credentials"}), 401
    access_token = create_access_token(user.id)
    # create refresh token
    raw_refresh = generate_refresh_token()
    token_hash = hash_token(raw_refresh)
    expires_at = datetime.utcnow() + timedelta(days=current_app.config.get("REFRESH_TOKEN_EXPIRES_DAYS",30))
    rt = RefreshToken(user_id=user.id, token_hash=token_hash, user_agent=request.headers.get("User-Agent"), ip=request.remote_addr, expires_at=expires_at)
    db.session.add(rt)
    db.session.commit()
    # set cookie
    cookie_name = current_app.config.get("REFRESH_TOKEN_COOKIE_NAME", "refresh_token")
    secure = current_app.config.get("COOKIE_SECURE", False)
    resp = make_response(jsonify({"access_token": access_token, "user": user.to_dict()}))
    resp.set_cookie(cookie_name, raw_refresh, httponly=True, secure=secure, samesite="Strict", path="/")
    return resp

@bp.route("/refresh", methods=["POST"])
def refresh():
    cookie_name = current_app.config.get("REFRESH_TOKEN_COOKIE_NAME", "refresh_token")
    raw = request.cookies.get(cookie_name)
    if not raw:
        return jsonify({"error": "no refresh token"}), 401
    token_hash = hash_token(raw)
    rt = RefreshToken.query.filter_by(token_hash=token_hash, revoked=False).first()
    if not rt:
        return jsonify({"error": "invalid refresh token"}), 401
    if rt.expires_at < datetime.utcnow():
        return jsonify({"error": "refresh token expired"}), 401
    # rotate: revoke existing and create new
    rt.revoked = True
    db.session.add(rt)
    raw_refresh = generate_refresh_token()
    new_hash = hash_token(raw_refresh)
    expires_at = datetime.utcnow() + timedelta(days=current_app.config.get("REFRESH_TOKEN_EXPIRES_DAYS",30))
    new_rt = RefreshToken(user_id=rt.user_id, token_hash=new_hash, user_agent=request.headers.get("User-Agent"), ip=request.remote_addr, expires_at=expires_at)
    db.session.add(new_rt)
    db.session.commit()
    access_token = create_access_token(rt.user_id)
    secure = current_app.config.get("COOKIE_SECURE", False)
    resp = make_response(jsonify({"access_token": access_token}))
    resp.set_cookie(cookie_name, raw_refresh, httponly=True, secure=secure, samesite="Strict", path="/")
    return resp

@bp.route("/logout", methods=["POST"])
def logout():
    cookie_name = current_app.config.get("REFRESH_TOKEN_COOKIE_NAME", "refresh_token")
    raw = request.cookies.get(cookie_name)
    if raw:
        token_hash = hash_token(raw)
        rt = RefreshToken.query.filter_by(token_hash=token_hash, revoked=False).first()
        if rt:
            rt.revoked = True
            db.session.add(rt)
            db.session.commit()
    resp = make_response(jsonify({"msg": "logged out"}))
    resp.delete_cookie(cookie_name, path="/")
    return resp

@bp.route("/me", methods=["GET"])
def me():
    # simple bearer token check
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "missing token"}), 401
    token = auth.split(None,1)[1]
    try:
        payload = None
        from app.utils.security import decode_access_token
        payload = decode_access_token(token)
    except Exception:
        return jsonify({"error": "invalid or expired token"}), 401
    user_id = payload.get("sub")
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "user not found"}), 404
    return jsonify({"user": user.to_dict()})
