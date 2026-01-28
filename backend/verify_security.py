import requests
import sys
import time

BASE_URL = "http://127.0.0.1:5008"
session = requests.Session()

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def test_sql_injection_login():
    log("Testing SQL Injection on Login...")
    payloads = [
        "' OR '1'='1",
        "admin' --",
        "' OR 1=1 --"
    ]
    
    for p in payloads:
        # We expect this to fail (401), NOT succeed (200) or error (500)
        resp = session.post(f"{BASE_URL}/auth/login", json={"email": p, "password": "password"})
        if resp.status_code == 200:
            log(f"❌ VULNERABLE: Login succeeded with payload: {p}", "FAIL")
            return False
        elif resp.status_code == 500:
            log(f"⚠️ POTENTIAL: 500 Error with payload: {p}", "WARN")
            # 500 is bad practice but technically maybe not full bypass. But we want 401.
            return False
            
    log("✅ SAFE: SQL Injection payloads rejected (401/403).", "PASS")
    return True

def test_xss_registration():
    log("\nTesting XSS on Registration...")
    xss_payload = "<script>alert('XSS')</script>"
    email = f"xss_{int(time.time())}@example.com"
    
    # Register with XSS payload in password (if reflected?) or stored in email?
    # Email validation should catch it.
    resp = session.post(f"{BASE_URL}/auth/register", json={"email": email, "password": xss_payload})
    
    if resp.status_code == 201:
        # Check if payload is returned unescaped in response
        if xss_payload in resp.text:
            log("❌ VULNERABLE: XSS payload reflected in response.", "FAIL")
            return False
        log("✅ SAFE: Registration successful but payload not reflected improperly.", "PASS")
    else:
        log(f"✅ SAFE: Payload rejected (Status {resp.status_code}).", "PASS")
    return True

def test_mass_assignment():
    log("\nTesting Mass Assignment (is_admin)...")
    email = f"mass_{int(time.time())}@example.com"
    password = "Password123!"
    
    # Try to inject is_admin=True during register
    resp = session.post(f"{BASE_URL}/auth/register", json={
        "email": email, 
        "password": password,
        "is_admin": True,
        "role": "admin"
    })
    
    if resp.status_code == 201:
        # Login and check user dict
        login_resp = session.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        user_data = login_resp.json().get('user', {})
        
        if user_data.get('is_admin') is True or user_data.get('role') == 'admin':
             log("❌ VULNERABLE: Mass assignment successful.", "FAIL")
             return False
             
    log("✅ SAFE: Extra fields ignored or handled.", "PASS")
    return True

if __name__ == "__main__":
    tests = [
        test_sql_injection_login(),
        test_xss_registration(),
        test_mass_assignment()
    ]
    
    if all(tests):
        print("\n🎉 Security Audit Passed: No obvious vulnerabilities found.")
        sys.exit(0)
    else:
        print("\n❌ Security Audit Failed: Vulnerabilities detected.")
        sys.exit(1)
