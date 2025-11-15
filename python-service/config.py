"""
Configuration management for the analysis service
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Application configuration"""
    
    # FastAPI
    PORT = int(os.getenv("PORT", "8000"))
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    # OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    OPENAI_MAX_RETRIES = int(os.getenv("OPENAI_MAX_RETRIES", "3"))
    
    # Google Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    GEMINI_MAX_RETRIES = int(os.getenv("GEMINI_MAX_RETRIES", "3"))
    GEMINI_TEMPERATURE = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
    GEMINI_MAX_OUTPUT_TOKENS = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "2048"))
    
    # MongoDB
    MONGODB_URI = os.getenv("MONGODB_URI")
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
    
    # Analysis settings
    MAX_DATASET_ROWS = int(os.getenv("MAX_DATASET_ROWS", "50000"))
    MIN_COLUMNS = int(os.getenv("MIN_COLUMNS", "2"))
    MIN_ROWS = int(os.getenv("MIN_ROWS", "10"))
    CORRELATION_THRESHOLD = float(os.getenv("CORRELATION_THRESHOLD", "0.5"))
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        required = [
            ("GEMINI_API_KEY", cls.GEMINI_API_KEY),
            ("MONGODB_URI", cls.MONGODB_URI),
            ("CLOUDINARY_CLOUD_NAME", cls.CLOUDINARY_CLOUD_NAME),
            ("CLOUDINARY_API_KEY", cls.CLOUDINARY_API_KEY),
            ("CLOUDINARY_API_SECRET", cls.CLOUDINARY_API_SECRET),
        ]
        
        missing = [name for name, value in required if not value]
        if missing:
            raise ValueError(f"Missing required configuration: {', '.join(missing)}")


config = Config()
