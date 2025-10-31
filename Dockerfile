FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# system deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev netcat gcc \
    && rm -rf /var/lib/apt/lists/*

# install python deps
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# copy project
COPY . /app

# create a non-root user
RUN adduser --disabled-password --gecos "" appuser || true
USER appuser

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["gunicorn", "blood_management.wsgi:application", "--bind", "0.0.0.0:8000"]
