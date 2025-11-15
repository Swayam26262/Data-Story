"""
Vercel serverless function entry point for DataStory AI Python service
"""
import sys
import os

# Add parent directory to path to import from main module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from main import app

# Export the FastAPI app for Vercel
handler = app
