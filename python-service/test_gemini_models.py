"""Quick script to list available Gemini models"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not found")
    exit(1)

genai.configure(api_key=api_key)

print("Available Gemini models:")
print("-" * 50)
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✓ {model.name}")
        print(f"  Display name: {model.display_name}")
        print(f"  Description: {model.description}")
        print()
