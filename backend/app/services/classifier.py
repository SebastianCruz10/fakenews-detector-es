import os
import logging
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

logger = logging.getLogger(__name__)

MODELOS = {
    "mrbert-es_E1": "SebastianCruz10/fakenews-mrbert-es-E1",
    "mrbert-es_E0": "SebastianCruz10/fakenews-mrbert-es-E0",
    "mroberta_E0":  "SebastianCruz10/fakenews-mroberta-E0",
    "mroberta_E1":  "SebastianCruz10/fakenews-mroberta-E1",
}


class ClassifierService:
    def __init__(self):
        self._tokenizer = None
        self._model = None
        self._active_model_id: str | None = None
        self._device = "cuda" if torch.cuda.is_available() else "cpu"

    def load_model(self, model_id: str) -> None:
        hf_repo = MODELOS[model_id]
        token = os.getenv("HF_TOKEN")
        logger.info("Cargando modelo %s desde %s", model_id, hf_repo)
        self._tokenizer = AutoTokenizer.from_pretrained(
            hf_repo,
            token=token,
            trust_remote_code=True,
            use_fast=False
        )
        self._model = AutoModelForSequenceClassification.from_pretrained(
            hf_repo, token=token
        ).to(self._device)
        self._model.eval()
        self._active_model_id = model_id
        logger.info("Modelo %s cargado en %s", model_id, self._device)

    def predict(self, text: str) -> dict:
        inputs = self._tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        ).to(self._device)
        with torch.no_grad():
            logits = self._model(**inputs).logits
        probs = torch.softmax(logits, dim=-1).squeeze()
        label_id = int(torch.argmax(logits))
        label = "FALSA" if label_id == 1 else "REAL"
        return {
            "label": label,
            "confidence": round(float(probs[label_id]), 4),
            "probabilities": {
                "real": round(float(probs[0]), 4),
                "fake": round(float(probs[1]), 4),
            },
            "model_id": self._active_model_id,
        }

    @property
    def active_model_id(self) -> str | None:
        return self._active_model_id


classifier_service = ClassifierService()
