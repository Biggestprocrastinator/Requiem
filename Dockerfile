# Stage 1: Build the frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY qshield-backend/frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend code and build
COPY qshield-backend/frontend/ ./
RUN npm run build


# Stage 2: Build the backend and runner
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies needed for Nmap and downloading binaries
RUN apt-get update && apt-get install -y \
    nmap \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Download and install ProjectDiscovery tools (Linux binaries)
# Subfinder
RUN wget https://github.com/projectdiscovery/subfinder/releases/download/v2.6.6/subfinder_2.6.6_linux_amd64.zip && \
    unzip -o subfinder_2.6.6_linux_amd64.zip -d /usr/local/bin/ && \
    rm subfinder_2.6.6_linux_amd64.zip

# HTTPX
RUN wget https://github.com/projectdiscovery/httpx/releases/download/v1.6.0/httpx_1.6.0_linux_amd64.zip && \
    unzip -o httpx_1.6.0_linux_amd64.zip -d /usr/local/bin/ && \
    rm httpx_1.6.0_linux_amd64.zip

# Nuclei
RUN wget https://github.com/projectdiscovery/nuclei/releases/download/v3.3.0/nuclei_3.3.0_linux_amd64.zip && \
    unzip -o nuclei_3.3.0_linux_amd64.zip -d /usr/local/bin/ && \
    rm nuclei_3.3.0_linux_amd64.zip

# Copy backend requirements and install
COPY qshield-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire qshield-backend folder into /app
# We'll copy just the necessary backend files to avoid copying the exe files and unnecessary stuff
COPY qshield-backend/backend/ ./backend/

# Copy the built frontend from Stage 1 into /app/frontend/dist/
COPY --from=frontend-builder /app/frontend/dist/ ./frontend/dist/

# Expose the application port
EXPOSE 8000

# Set environment variables so Python won't buffer stdout/stderr
ENV PYTHONUNBUFFERED=1

# Start the application
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
