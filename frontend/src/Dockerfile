# Python Base Image
FROM python:3.10-slim

# Working Directory
WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0

# Copy requirements and install python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ .

# Expose port for FastAPI
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]