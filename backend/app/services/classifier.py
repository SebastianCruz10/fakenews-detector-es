import os
import re
import logging
import unicodedata
import torch
from transformers import AutoModelForSequenceClassification, PreTrainedTokenizerFast

logger = logging.getLogger(__name__)

MODELOS = {
    "mrbert-es_E1": "SebastianCruz10/fakenews-mrbert-es-E1",
    "mrbert-es_E0": "SebastianCruz10/fakenews-mrbert-es-E0",
    "mroberta_E0":  "SebastianCruz10/fakenews-mroberta-E0",
    "mroberta_E1":  "SebastianCruz10/fakenews-mroberta-E1",
}

# Characters copy-pasted from web pages that produce unusual tokens in the model
_NORM_TABLE = str.maketrans({
    0x00A0: " ",   # non-breaking space -> regular space
    0x00AD: None,  # soft hyphen -> delete
    0x200B: None,  # zero-width space -> delete
    0x200C: None,  # zero-width non-joiner -> delete
    0x200D: None,  # zero-width joiner -> delete
    0xFEFF: None,  # BOM -> delete
    0x000D: " ",   # carriage return -> space
})


def _normalize_text(text: str) -> str:
    """Remove copy-paste artifacts so tokenization matches training distribution."""
    text = unicodedata.normalize("NFC", text)
    text = text.translate(_NORM_TABLE)
    return re.sub(r"\s{2,}", " ", text).strip()


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
        # AutoTokenizer falla con tokenizer_class=TokenizersBackend (inválido en transformers).
        # PreTrainedTokenizerFast lee tokenizer.json directamente sin verificar esa clave.
        self._tokenizer = PreTrainedTokenizerFast.from_pretrained(
            hf_repo,
            token=token,
        )
        self._model = AutoModelForSequenceClassification.from_pretrained(
            hf_repo, token=token
        ).to(self._device)
        self._model.eval()
        self._active_model_id = model_id
        logger.info(
            "Modelo %s cargado en %s | id2label=%s",
            model_id,
            self._device,
            self._model.config.id2label,
        )

    def predict(self, text: str) -> dict:
        text = _normalize_text(text)
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
        label_id = int(torch.argmax(logits, dim=-1).squeeze().item())

        # Use id2label from model config (set during fine-tuning); fall back to convention
        id2label = getattr(self._model.config, "id2label", {0: "REAL", 1: "FALSA"})
        raw = id2label.get(label_id, "").upper()
        if any(k in raw for k in ("FAKE", "FALSA", "FALSE")):
            label = "FALSA"
        elif "REAL" in raw:
            label = "REAL"
        else:
            label = "FALSA" if label_id == 1 else "REAL"

        logger.info(
            "predict | model=%s logits=%s label_id=%d label=%s conf=%.4f",
            self._active_model_id,
            [round(x, 4) for x in logits.squeeze().tolist()],
            label_id,
            label,
            float(probs[label_id]),
        )

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
