from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

class RefreshToken(db.Model):
    __tablename__ = "refresh_tokens"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = db.Column(db.String(255), nullable=False)
    user_agent = db.Column(db.String(512), nullable=True)
    ip = db.Column(db.String(50), nullable=True)
    revoked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
