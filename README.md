# Fake News Detector ES

Aplicativo web de detección de noticias falsas en español con explicabilidad integrada,
basado en modelos Transformer fine-tuned sobre el dataset FakeDeS.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI + Uvicorn |
| Modelo | BETO / RoBERTa-es (HuggingFace Transformers) |
| Explicabilidad | SHAP |
| Extracción web | Trafilatura |
| Frontend | React 18 + Tailwind CSS |
| Deploy backend | Render (Docker) |

## Estructura del proyecto

```
fakenews-detector-es/
├── backend/          # API FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/  # predict, explain, extract, model_info
│   │   ├── services/ # classifier, explainer, extractor
│   │   └── models/   # Pydantic schemas
│   ├── requirements.txt
│   └── Dockerfile
├── notebooks/        # Pipeline de datos y fine-tuning
│   ├── 01_split_FakeDeS.ipynb
│   ├── 02_augment_E1.ipynb
│   ├── 03_build_E0.ipynb
│   ├── 04_build_E1.ipynb
│   └── 05_finetune.ipynb
├── data/
│   ├── raw/          # Dataset FakeDeS original
│   └── processed/    # Splits E0 y E1 listos para entrenamiento
└── models/           # Modelos fine-tuned exportados
```

## Experimentos

- **E0** — Fine-tuning sobre datos originales (sin aumentación)
- **E1** — Fine-tuning sobre datos aumentados (back-translation)

## Inicio rápido (backend local)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

## Deploy en Render

El `Dockerfile` está configurado para leer la variable de entorno `PORT`
que Render inyecta automáticamente. Solo conecta el repositorio y apunta
al directorio `backend/`.
