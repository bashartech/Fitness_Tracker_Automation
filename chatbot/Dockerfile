# Use official Python base image
FROM python:3.11-slim

# Set a working directory inside the container
WORKDIR /app

# Copy only necessary files first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies without cache to save space
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project including root files
COPY . .

# Set PYTHONPATH to include both root and app directories
ENV PYTHONPATH=/app

# Expose the port your FastAPI app will run on
EXPOSE 7860

# Command to run the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]