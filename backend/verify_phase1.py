import requests
import sys

BASE_URL = "http://127.0.0.1:5001"

def test_register():
    print("Testing Registration...")
    payload = {
        "email": "test@example.com",
        "password": "SecurePassword123!"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if response.status_code == 201:
            print("✅ Registration Successful")
            return True
        elif response.status_code == 409:
            print("ℹ️ User already exists (Expected if running multiple times)")
            return True
        else:
            print(f"❌ Registration Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return False

def test_login():
    print("Testing Login...")
    payload = {
        "email": "test@example.com",
        "password": "SecurePassword123!"
    }
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload)
        if response.status_code == 200:
            token = response.json().get('access_token')
            if token:
                print("✅ Login Successful. Token received.")
                return True
            else:
                print("❌ Login Failed: No token in response")
                return False
        else:
            print(f"❌ Login Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return False

if __name__ == "__main__":
    if test_register() and test_login():
        print("\n🎉 Phase 1 Verification Passed!")
        sys.exit(0)
    else:
        print("\n💥 Verification Failed")
        sys.exit(1)
