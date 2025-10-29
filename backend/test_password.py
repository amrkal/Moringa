import bcrypt

password = "admin123"
stored_hash = "$2b$12$o/zf60CEvnDMtC77/Cil3.Pai9FY4VP3lf7mMeVz.3Y9EMJ.DUvYK"

password_bytes = password.encode('utf-8')
hash_bytes = stored_hash.encode('utf-8')

result = bcrypt.checkpw(password_bytes, hash_bytes)
print(f"Password verification result: {result}")
