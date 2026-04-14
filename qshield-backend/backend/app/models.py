from sqlalchemy import Column, Integer, String, Boolean
from backend.app.db import Base

# Valid role values
VALID_ROLES = {"admin", "viewer", "auditor", "itadmin"}


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Role-based access control
    # admin   → full access
    # viewer  → read-only (PNB Checker)
    # auditor → viewer + reports
    # itadmin → viewer + vulnerability scan + settings
    role = Column(String, default="viewer", nullable=False, server_default="viewer")

    # 2FA (TOTP) fields — nullable so existing rows are unaffected
    totp_secret = Column(String, nullable=True)
    totp_enabled = Column(Boolean, default=False, nullable=False, server_default="0")
