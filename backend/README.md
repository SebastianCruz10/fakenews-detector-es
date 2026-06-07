---
title: FakeDetector ES
emoji: 🔍
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# FakeDetector ES API

Aplicativo web de detección de fake news en español con explicabilidad 
integrada, basado en modelos Transformer fine-tuned.

## Endpoints

- `POST /api/predict` — Clasificación binaria real/fake
- `POST /api/explain` — Explicabilidad SHAP token-nivel  
- `POST /api/extract` — Extracción de texto desde URL
- `GET /api/model-info` — Metadatos del modelo activo
