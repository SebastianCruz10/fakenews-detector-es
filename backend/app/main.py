"""
main.py — FastAPI application entry point.

Responsabilidades:
- Crear y configurar la instancia de FastAPI
- Registrar todos los routers (predict, explain, extract, model_info)
- Configurar CORS para permitir peticiones desde el frontend React
- Definir el evento de startup para cargar el modelo en memoria
- Exponer el endpoint raíz de health-check
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# from app.routers import predict, explain, extract, model_info

app = FastAPI(
    title="Fake News Detector ES",
    description="API de detección de fake news en español con explicabilidad SHAP/LIME",
    version="0.1.0",
)

# --- CORS ---
# TODO: restringir origins a la URL del frontend en producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
# app.include_router(predict.router, prefix="/api/predict", tags=["Predicción"])
# app.include_router(explain.router, prefix="/api/explain", tags=["Explicabilidad"])
# app.include_router(extract.router, prefix="/api/extract", tags=["Extracción"])
# app.include_router(model_info.router, prefix="/api/model", tags=["Modelo"])


@app.get("/", tags=["Health"])
async def root():
    """Health-check endpoint."""
    return {"status": "ok", "service": "fakenews-detector-es"}


# --- Startup event ---
# @app.on_event("startup")
# async def load_model():
#     """Carga el modelo Transformer fine-tuned al iniciar el servidor."""
#     from app.services.classifier import ClassifierService
#     ClassifierService.load()
