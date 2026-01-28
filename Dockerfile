# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy frontend deps and install
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (needed for Postgres)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend Code
COPY backend/ ./backend/

# Copy Built Frontend Assets to Backend Static Folder
COPY --from=frontend-build /app/frontend/dist ./backend/app/static/

# Set Environment Variables
ENV FLASK_APP=run.py
ENV FLASK_ENV=production

# Expose Port (Render sets $PORT env var, but we verify mapping)
EXPOSE 5000

# Run Command
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--chdir", "backend", "run:app"]
