FROM python:3.11

# Install system dependencies including node, npm, and git for building the application.
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY . /app

WORKDIR /app
RUN uv sync --frozen --no-cache

CMD ["uv", "run", "fastapi", "run", "app/main.py", "--port", "80", "--host", "0.0.0.0"]