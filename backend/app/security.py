import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password using bcrypt"""
    try:
        if not plain_password or not hashed_password:
            print(f"Password verification error: Missing password or hash")
            return False
            
        # Ensure password is not too long (bcrypt limit is 72 bytes)
        if len(plain_password.encode('utf-8')) > 72:
            plain_password = plain_password[:72]
        
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt"""
    try:
        if not password:
            raise ValueError("Password cannot be empty")
            
        # Ensure password is not too long (bcrypt limit is 72 bytes)
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
            
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    except Exception as e:
        print(f"Password hashing error: {e}")
        raise