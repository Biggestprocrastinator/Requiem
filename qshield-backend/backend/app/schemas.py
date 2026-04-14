from pydantic import BaseModel, EmailStr, field_validator
import re


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long.')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter.')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number.')
        if not re.search(r'[^A-Za-z0-9]', v):
            raise ValueError('Password must contain at least one special character.')
        return v


class UserOut(UserBase):
    id: int
    email: str
    role: str = "viewer"
    totp_enabled: bool = False

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# ---------------------------------------------------------------------------
# 2FA / Login schemas
# ---------------------------------------------------------------------------

class LoginWithTOTPResponse(BaseModel):
    """Returned by POST /auth/login.
    If requires_2fa=True, the caller must complete TOTP verification.
    """
    access_token: str | None = None
    token_type: str = "bearer"
    requires_2fa: bool = False
    temp_token: str | None = None  # short-lived token for the 2FA step
    role: str | None = None        # echoed back for convenience (also embedded in JWT)


class TOTPSetupResponse(BaseModel):
    """Returned by GET /auth/2fa/setup — contains QR code and manual entry secret."""
    qr_code: str   # SVG data URI
    secret: str    # Base32 secret for manual entry in authenticator app


class TOTPCodeRequest(BaseModel):
    """Used for /auth/2fa/enable and /auth/2fa/disable — just a 6-digit code."""
    code: str


class TOTPVerifyLoginRequest(BaseModel):
    """Used by /auth/2fa/verify — temp token from login + TOTP code."""
    temp_token: str
    code: str
