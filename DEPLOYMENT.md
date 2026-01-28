# Deploying AuthNexus

This guide describes how to deploy AuthNexus to a production environment using Docker.

## Option 1: Virtual Private Server (VPS) - Recommended
*Best for: DigitalOcean Droplets, AWS EC2, Linode, Google Compute Engine.*

### 1. Provision a Server
- Launch a VPS (Ubuntu 22.04 LTS recommended).
- Allow HTTP (80), HTTPS (443), and SSH (22) traffic in the firewall.

### 2. Install Docker
SSH into your server and install Docker & Docker Compose:

```bash
# Provide permissions
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose (V2 is included in newer docker-ce, otherwise standard plugin)
sudo apt install -y docker-compose-plugin
```

### 3. Deploy Application

```bash
# 1. Clone the repository
git clone https://github.com/sidharthprem310/AuthNexus.git
cd AuthNexus

# 2. Setup Environment Variables
# Create a .env file for production secrets
nano .env
```

**Paste the following into `.env` (Change values!):**
```ini
FLASK_APP=run.py
FLASK_ENV=production
SECRET_KEY=REPLACE_WITH_A_LONG_SECURE_RANDOM_STRING
DATABASE_URL=sqlite:///authnexus.db  # Or use a postgres connection string
```

```bash
# 3. Start the Application
sudo docker compose up -d --build
```

Your app is now running on port 80.

### 4. Enable HTTPS (SSL)
To secure your application (mandatory for real Auth usage), use Nginx + Certbot.
The easiest way is to modify `docker-compose.yml` to include an Nginx sidecar for SSL, or set up a reverse proxy on the host machine.

**Host Reverse Proxy Method (Simplest):**
1. stop the frontend container mapping to port 80 (change docker-compose to map to 8080:80).
2. Install Nginx on host: `sudo apt install nginx`.
3. Use Certbot: `sudo apt install certbot python3-certbot-nginx`.
4. `sudo certbot --nginx -d yourdomain.com`.

## Option 2: Cloud PaaS (Render/Railway)
*Note: This requires a Dockerfile-based deployment.*

1.  **Fork** the repo to your GitHub.
2.  **Create a New Web Service**.
3.  Select **Docker** as the environment.
4.  Add Environment Variables (`SECRET_KEY`).
5.  Deploy.

*Note: Since this repo uses docker-compose with multiple containers, PaaS deployment might require deploying Backend and Frontend as two separate services.*

## Production Checklist
- [ ] **Change SECRET_KEY**: Never use the default.
- [ ] **Use a real Database**: Switch from SQLite to PostgreSQL for concurrency (Update `DATABASE_URL` and install `psycopg2-binary` in Backend Dockerfile).
- [ ] **Enable HTTPS**: Use SSL certificates.
- [ ] **Disable Debug Mode**: Ensure `FLASK_DEBUG=0`.
