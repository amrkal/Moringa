from passlib.context import CryptContext
import bcrypt

# Password hashing context with explicit bcrypt configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Try with passlib first
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # Fallback to bcrypt module directly
        try:
            password_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception as e2:
            print(f"Password verification error: {e}, {e2}")
            return False

def get_password_hash(password: str) -> str:
    try:
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    except Exception as e:
        print(f"Password hashing error: {e}")
        # Fallback to passlib
        return pwd_context.hash(password)