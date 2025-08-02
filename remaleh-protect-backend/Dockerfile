FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5001

# Set environment variables
ENV FLASK_ENV=production
ENV DEBUG=false

# Run the application
CMD ["python", "src/main.py"]

