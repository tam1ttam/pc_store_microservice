FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirement.txt .
RUN pip install --no-cache-dir -r requirement.txt

# Copy source
COPY . .

EXPOSE 6070

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "6070"]