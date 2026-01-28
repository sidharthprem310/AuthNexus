import requests
import time

BASE_URL = "http://127.0.0.1:5008"
EMAIL = f"frontend_user_{int(time.time())}@example.com"
PASSWORD = "SecurePassword123!"

def setup():
    print(f"Registering {EMAIL}...")
    resp = requests.post(f"{BASE_URL}/auth/register", json={"email": EMAIL, "password": PASSWORD})
    if resp.status_code == 201:
        print(f"✅ User Registered: {EMAIL} / {PASSWORD}")
        return EMAIL, PASSWORD
    else:
        print(f"❌ Failed: {resp.text}")
        return None, None

if __name__ == "__main__":
    setup()
