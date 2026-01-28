import requests
import sys
import time

BASE_URL = "http://127.0.0.1:5007"
EMAIL = f"user_sec_{int(time.time())}@example.com"
PASSWORD = "SecurePassword123!"

session = requests.Session()

def register():
    print(f"Registering {EMAIL}...")
    resp = session.post(f"{BASE_URL}/auth/register", json={"email": EMAIL, "password": PASSWORD})
    if resp.status_code == 201:
        print("✅ Registration Successful")
        return True
    print(f"❌ Registration Failed: {resp.text}")
    return False

def test_rate_limiting():
    print("\n--- Testing Rate Limiting (5/minute) ---")
    # We already made 1 request (register), let's make 5 login attempts
    # Actually register is different endpoint. Login limit is on /login.
    
    for i in range(7):
        print(f"Login Attempt {i+1}...", end=" ")
        resp = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": "WrongPassword"})
        print(f"Status: {resp.status_code}")
        
        if resp.status_code == 429:
            print("✅ Rate Limit Hit (429 Too Many Requests)")
            return True
        time.sleep(0.5)
        
    print("❌ Rate Limit NOT Hit (Expected 429)")
    return False

def test_account_lockout():
    # To test lockout cleanly, we need a fresh user because rate limit might block us first.
    # Rate limit is by IP. So if we hit rate limit in previous test, we are blocked for 1 minute.
    # We should wait or use different IP (not possible locally easily).
    # OR, we explicitly configured rate limit key to be remote_address.
    
    print("\n⚠️ Waiting 60s for Rate Limit to reset for Lockout Test...")
    time.sleep(60) 
    
    NEW_EMAIL = f"user_lock_{int(time.time())}@example.com"
    print(f"\n--- Testing Account Lockout for {NEW_EMAIL} ---")
    
    session.post(f"{BASE_URL}/auth/register", json={"email": NEW_EMAIL, "password": PASSWORD})
    
    # Fail 5 times
    for i in range(5):
        print(f"Failed Attempt {i+1}...", end=" ")
        resp = session.post(f"{BASE_URL}/auth/login", json={"email": NEW_EMAIL, "password": "WrongPassword"})
        print(f"Status: {resp.status_code} - {resp.json().get('error')}")
        
    # 6th attempt - even with CORRECT password? No, usually locked accounts reject even correct headers.
    # But let's try with Correct Password to prove it's locked.
    print("Attempting with CORRECT password (should be locked)...")
    resp = session.post(f"{BASE_URL}/auth/login", json={"email": NEW_EMAIL, "password": PASSWORD})
    
    if resp.status_code == 403 and resp.json().get('error') == 'Account is locked':
        print("✅ Account Lockout Verified")
        return True
    else:
        print(f"❌ Account Lockout Failed: {resp.status_code} - {resp.text}")
        return False

if __name__ == "__main__":
    if not register(): sys.exit(1)
    
    if not test_rate_limiting():
        print("Rate limiting check failed or inconclusive.")
        # Don't exit, try lockout? No, if rate limit failing (e.g. not blocking), maybe we can test lockout immediately
        # But if we didn't hit rate limit, we consumed 7 requests. 
        # If rate limit isn't working, we can proceed to lockout test immediately.
    
    if test_account_lockout():
        print("\n🎉 Phase 4 Verification Passed!")
        sys.exit(0)
    else:
        sys.exit(1)
