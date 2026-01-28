import requests
import sys
import pyotp
import time

BASE_URL = "http://127.0.0.1:5002"
EMAIL = f"user_mfa_{int(time.time())}@example.com"
PASSWORD = "SecurePassword123!"

session = requests.Session()

def register():
    print(f"Testing Registration for {EMAIL}...")
    payload = {"email": EMAIL, "password": PASSWORD}
    response = session.post(f"{BASE_URL}/auth/register", json=payload)
    if response.status_code == 201:
        print("✅ Registration Successful")
        return True
    print(f"❌ Registration Failed: {response.text}")
    return False

def login_initial():
    print("Testing Initial Login (MFA Disabled)...")
    payload = {"email": EMAIL, "password": PASSWORD}
    response = session.post(f"{BASE_URL}/auth/login", json=payload)
    if response.status_code == 200:
        data = response.json()
        if 'access_token' in data and not data.get('mfa_required'):
            print("✅ Initial Login Successful")
            return data['access_token']
    print(f"❌ Initial Login Failed: {response.text}")
    return None

def setup_mfa(token):
    print("Testing MFA Setup...")
    headers = {"Authorization": f"Bearer {token}"}
    response = session.post(f"{BASE_URL}/mfa/setup", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ MFA Setup Successful. Secret: {data['secret']}")
        return data['secret']
    print(f"❌ MFA Setup Failed: {response.text}")
    return None

def enable_mfa(token, secret):
    print("Testing MFA Enable...")
    headers = {"Authorization": f"Bearer {token}"}
    totp = pyotp.TOTP(secret)
    otp = totp.now()
    payload = {"secret": secret, "otp": otp}
    
    response = session.post(f"{BASE_URL}/mfa/enable", headers=headers, json=payload)
    if response.status_code == 200:
        print("✅ MFA Enabled Successful")
        return True
    print(f"❌ MFA Enable Failed: {response.text}")
    return False

def login_mfa_challenge():
    print("Testing Login with MFA Enabled...")
    payload = {"email": EMAIL, "password": PASSWORD}
    response = session.post(f"{BASE_URL}/auth/login", json=payload)
    if response.status_code == 200:
        data = response.json()
        if data.get('mfa_required'):
            print("✅ MFA Challenge Received")
            return data['mfa_token']
    print(f"❌ MFA Challenge Failed (Expected mfa_required): {response.text}")
    return None

def verify_2fa(mfa_token, secret):
    print("Testing 2FA Verification...")
    headers = {"Authorization": f"Bearer {mfa_token}"}
    totp = pyotp.TOTP(secret)
    otp = totp.now()
    payload = {"otp": otp}
    
    response = session.post(f"{BASE_URL}/auth/verify-2fa", headers=headers, json=payload)
    if response.status_code == 200:
        data = response.json()
        if 'access_token' in data:
            print("✅ 2FA Verification Successful. Full access token received.")
            return True
    print(f"❌ 2FA Verification Failed: {response.text}")
    return False

if __name__ == "__main__":
    if not register(): sys.exit(1)
    
    token = login_initial()
    if not token: sys.exit(1)
    
    secret = setup_mfa(token)
    if not secret: sys.exit(1)
    
    if not enable_mfa(token, secret): sys.exit(1)
    
    # 2nd Login
    mfa_token = login_mfa_challenge()
    if not mfa_token: sys.exit(1)
    
    if verify_2fa(mfa_token, secret):
        print("\n🎉 Phase 2 Verification Passed!")
        sys.exit(0)
    else:
        sys.exit(1)
