# One image for both the FastAPI sidecar and the worker; compose overrides the command
# for ml-worker (python -m trainer.scheduler). Default command serves the API.
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HOME=/app/.cache/hf

WORKDIR /app

COPY requirements.txt .
# CPU-only torch first so FlagEmbedding doesn't pull the multi-GB CUDA build.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY trainer ./trainer

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
