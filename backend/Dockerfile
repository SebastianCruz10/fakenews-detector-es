# Base image — Python 3.11 slim para menor tamaño de imagen
FROM python:3.11-slim

# Evita archivos .pyc y activa salida sin buffer (mejor para logs en Render)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema necesarias para torch y trafilatura
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias Python primero (aprovecha cache de capas)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY . .

# Render asigna el puerto vía variable de entorno PORT (default 8000)
ENV PORT=8000

# Exponer el puerto
EXPOSE $PORT

# Comando de inicio — Render ejecuta este comando al desplegar
# 0.0.0.0 necesario para que el contenedor sea accesible desde el exterior
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
