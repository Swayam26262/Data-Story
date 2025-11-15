"""
Test script to verify Vercel configuration for Python service
Run this locally before deploying to catch configuration issues
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_environment_variables():
    """Test that all required environment variables are set"""
    print("Testing environment variables...")
    
    required_vars = [
        "MONGODB_URI",
        "GEMINI_API_KEY",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ]
    
    optional_vars = [
        "ALLOWED_ORIGINS",
        "GEMINI_MODEL",
        "MIN_COLUMNS",
        "MIN_ROWS",
        "CORRELATION_THRESHOLD",
    ]
    
    missing = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing.append(var)
            print(f"  ❌ {var}: NOT SET")
        else:
            # Mask sensitive values
            if "KEY" in var or "SECRET" in var or "URI" in var:
                display_value = value[:10] + "..." if len(value) > 10 else "***"
            else:
                display_value = value
            print(f"  ✅ {var}: {display_value}")
    
    print("\nOptional variables:")
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var}: {value}")
        else:
            print(f"  ⚠️  {var}: Using default")
    
    if missing:
        print(f"\n❌ Missing required variables: {', '.join(missing)}")
        return False
    
    print("\n✅ All required environment variables are set")
    return True


def test_imports():
    """Test that all required packages can be imported"""
    print("\nTesting package imports...")
    
    packages = [
        ("fastapi", "FastAPI"),
        ("pydantic", "Pydantic"),
        ("pandas", "Pandas"),
        ("numpy", "NumPy"),
        ("sklearn", "scikit-learn"),
        ("pymongo", "PyMongo"),
        ("google.generativeai", "Google Generative AI"),
    ]
    
    failed = []
    for package, name in packages:
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  ❌ {name}")
            failed.append(name)
    
    if failed:
        print(f"\n❌ Failed to import: {', '.join(failed)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("\n✅ All packages imported successfully")
    return True


def test_config():
    """Test config module"""
    print("\nTesting config module...")
    
    try:
        from config import config
        print("  ✅ Config module loaded")
        
        # Test validation
        try:
            config.validate()
            print("  ✅ Config validation passed")
            return True
        except ValueError as e:
            print(f"  ❌ Config validation failed: {e}")
            return False
            
    except Exception as e:
        print(f"  ❌ Failed to load config: {e}")
        return False


def test_services():
    """Test that service modules can be imported"""
    print("\nTesting service modules...")
    
    services = [
        "services.preprocessor",
        "services.analyzer",
        "services.visualizer",
        "services.narrative_generator",
    ]
    
    failed = []
    for service in services:
        try:
            __import__(service)
            print(f"  ✅ {service}")
        except Exception as e:
            print(f"  ❌ {service}: {e}")
            failed.append(service)
    
    if failed:
        print(f"\n❌ Failed to import services: {', '.join(failed)}")
        return False
    
    print("\n✅ All service modules loaded successfully")
    return True


def test_fastapi_app():
    """Test that FastAPI app can be created"""
    print("\nTesting FastAPI app...")
    
    try:
        from main import app
        print("  ✅ FastAPI app created")
        
        # Check routes
        routes = [route.path for route in app.routes]
        expected_routes = ["/health", "/analyze"]
        
        for route in expected_routes:
            if route in routes:
                print(f"  ✅ Route {route} registered")
            else:
                print(f"  ❌ Route {route} not found")
                return False
        
        print("\n✅ FastAPI app configured correctly")
        return True
        
    except Exception as e:
        print(f"  ❌ Failed to create FastAPI app: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("DataStory AI Python Service - Vercel Configuration Test")
    print("=" * 60)
    
    tests = [
        ("Environment Variables", test_environment_variables),
        ("Package Imports", test_imports),
        ("Config Module", test_config),
        ("Service Modules", test_services),
        ("FastAPI App", test_fastapi_app),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Test '{name}' crashed: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Ready for Vercel deployment.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Fix issues before deploying.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
