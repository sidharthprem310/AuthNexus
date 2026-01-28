import requests
import sys
import time
from urllib.parse import urlparse, parse_qs

BASE_URL = "http://127.0.0.1:5008"
EMAIL = f"dev_{int(time.time())}@example.com"
PASSWORD = "SecurePassword123!"

session = requests.Session()

def register_and_login():
    print(f"Registering developer {EMAIL}...")
    session.post(f"{BASE_URL}/auth/register", json={"email": EMAIL, "password": PASSWORD})
    
    print("Logging in...")
    resp = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    return resp.json()['access_token']

def register_client(token):
    print("\n--- Registering OAuth Client ---")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "client_name": "My Cool App",
        "redirect_uris": "http://localhost:8080/callback"
    }
    resp = session.post(f"{BASE_URL}/oauth/clients", headers=headers, json=payload)
    if resp.status_code == 201:
        data = resp.json()
        print(f"✅ Client Registered. ID: {data['client_id']}")
        return data['client_id'], data['client_secret']
    print(f"❌ Client Registration Failed: {resp.text}")
    return None, None

def test_authorization_flow(token, client_id, client_secret):
    print("\n--- Testing Authorization Flow ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. GET /authorize (Prompt)
    print("1. Requesting Authorization Prompt...")
    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": "http://localhost:8080/callback",
        "scope": "profile"
    }
    resp = session.get(f"{BASE_URL}/oauth/authorize", headers=headers, params=params)
    if resp.status_code == 200:
        print("✅ Consent Screen Info Received")
    else:
        print(f"❌ Prompt Failed: {resp.text}")
        return False

    # 2. POST /authorize (Confirm)
    print("2. Confirming Authorization...")
    payload = {
        "client_id": client_id,
        "redirect_uri": "http://localhost:8080/callback",
        "consent": "allow",
        "scope": "profile"
    }
    resp = session.post(f"{BASE_URL}/oauth/authorize", headers=headers, json=payload)
    if resp.status_code == 200:
        redirect_url = resp.json()['redirect_uri']
        parsed = urlparse(redirect_url)
        code = parse_qs(parsed.query)['code'][0]
        print(f"✅ Authorization Code Received: {code}")
    else:
        print(f"❌ Authorization Failed: {resp.text}")
        return False

    # 3. POST /token (Exchange)
    print("3. Exchanging Code for Token...")
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": "http://localhost:8080/callback",
        "client_id": client_id,
        "client_secret": client_secret
    }
    # Note: Token endpoint is typically public (client auth via body or basic auth), 
    # checking our implementation... yes, it checks client_id/secret from body.
    resp = session.post(f"{BASE_URL}/oauth/token", json=payload)
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Access Token Received: {data['access_token'][:20]}...")
        return True
    else:
        print(f"❌ Token Exchange Failed: {resp.text}")
        return False

if __name__ == "__main__":
    try:
        user_token = register_and_login()
        client_id, client_secret = register_client(user_token)
        if client_id and test_authorization_flow(user_token, client_id, client_secret):
            print("\n🎉 Phase 5 Verification Passed!")
            sys.exit(0)
        else:
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
