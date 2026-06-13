from dotenv import load_dotenv
load_dotenv()

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.limiter import limiter
from app.routers import predict, explain, extract, model_info
from app.services.classifier import classifier_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Startup: cargando modelo de producción mrbert-es_E1")
    try:
        classifier_service.load_model("mrbert-es_E1")
        logger.info("Modelo cargado correctamente: mrbert-es_E1")
    except Exception as exc:
        logger.error("Error al cargar el modelo en startup: %s", exc)
    yield


app = FastAPI(
    title="FakeDetector ES API",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sebastiancruz10-fakenews-detector-es-frontend.hf.space",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router,    prefix="/api", tags=["Predicción"])
app.include_router(explain.router,    prefix="/api", tags=["Explicabilidad"])
app.include_router(extract.router,    prefix="/api", tags=["Extracción"])
app.include_router(model_info.router, prefix="/api", tags=["Modelo"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "modelo_activo": classifier_service.active_model_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
