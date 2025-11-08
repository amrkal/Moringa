from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # Database
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_database_name: str = "moringa_food_ordering"
    mongodb_test_database_name: str = "moringa_food_ordering_test"
    
    # JWT
    secret_key: str = "your-super-secret-jwt-key-change-this-in-production-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Twilio
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    
    # CORS
    frontend_url: str = "http://localhost:3000"
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # File Upload
    upload_dir: str = "uploads"
    max_file_size: int = 5242880  # 5MB
    allowed_image_types: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # App
    app_name: str = "Moringa Food Ordering System"
    app_version: str = "2.0.0"
    debug: bool = True
    environment: str = "development"
    
    # Email
    smtp_server: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    
    # Payment
    stripe_publishable_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    stripe_demo_mode: bool = False
    
    # M-Pesa
    mpesa_consumer_key: Optional[str] = None
    mpesa_consumer_secret: Optional[str] = None
    mpesa_business_short_code: Optional[str] = None
    mpesa_passkey: Optional[str] = None
    mpesa_callback_url: Optional[str] = None
    mpesa_environment: str = "sandbox"  # sandbox or production

    class Config:
        env_file = ".env"

settings = Settings()