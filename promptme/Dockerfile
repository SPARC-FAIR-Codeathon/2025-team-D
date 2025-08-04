FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy requirements first for better caching
COPY pyproject.toml uv.lock* ./

# Install UV and Python dependencies
RUN pip install uv
RUN uv sync --frozen

# Copy the rest of the application
COPY . .

# Create gen-repo directory
RUN mkdir -p /gen-repo

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "80"]