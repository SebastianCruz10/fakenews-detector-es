"""
services/classifier.py — Servicio de clasificación con modelo Transformer.

Responsabilidades:
- Cargar el modelo fine-tuned desde /models (AutoModelForSequenceClassification)
- Mantener el modelo en memoria como singleton durante la vida del servidor
- Tokenizar el texto de entrada con el tokenizer correspondiente
- Ejecutar la inferencia y devolver label + probabilidades softmax
- Truncar entradas largas al max_length del modelo (512 tokens para BERT-base)
"""

# from transformers import AutoTokenizer, AutoModelForSequenceClassification
# import torch
# from pathlib import Path

MODEL_DIR = "models/"  # ruta relativa a la raíz del proyecto


class ClassifierService:
    _model = None
    _tokenizer = None
    _id2label = {0: "REAL", 1: "FAKE"}

    @classmethod
    def load(cls):
        """Carga tokenizer y modelo desde MODEL_DIR. Llamar en startup."""
        # cls._tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        # cls._model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        # cls._model.eval()
        pass

    @classmethod
    async def predict(cls, text: str) -> dict:
        """
        Clasifica el texto.

        Returns:
            {label: str, confidence: float, probabilities: {REAL: float, FAKE: float}}
        """
        # inputs = cls._tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        # with torch.no_grad():
        #     logits = cls._model(**inputs).logits
        # probs = torch.softmax(logits, dim=-1).squeeze().tolist()
        # label_id = int(torch.argmax(logits))
        # return {
        #     "label": cls._id2label[label_id],
        #     "confidence": round(probs[label_id], 4),
        #     "probabilities": {cls._id2label[i]: round(p, 4) for i, p in enumerate(probs)},
        # }
        raise NotImplementedError

    @classmethod
    def get_info(cls) -> dict:
        """Devuelve metadatos del modelo activo."""
        # return {
        #     "model_name": cls._model.config._name_or_path,
        #     "base_architecture": cls._model.config.model_type,
        #     "status": "ready" if cls._model is not None else "not_loaded",
        # }
        raise NotImplementedError
