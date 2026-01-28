import requests

URL = "http://127.0.0.1:5000/auth/register"
DATA = {
    "email": "vapob17145@coswz.com",
    "password": "Password123!"
}

try:
    resp = requests.post(URL, json=DATA)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
except Exception as e:
    print(f"Error: {e}")
