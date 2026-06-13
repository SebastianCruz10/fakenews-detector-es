import logging
from collections import OrderedDict
import numpy as np
import shap
import torch

logger = logging.getLogger(__name__)

_CACHE_MAX = 128
_SHAP_MAX_WORDS = 100  # acotar tiempo de cómputo; el modelo acepta hasta 512 sub-tokens


class ExplainerService:
    def __init__(self):
        # LRU cache keyed by (text, model_id); evita recalcular SHAP para el mismo input
        self._cache: OrderedDict[tuple[str, str], list] = OrderedDict()

    def explain(self, text: str, classifier) -> list:
        model_id = classifier.active_model_id
        cache_key = (text, model_id)

        if cache_key in self._cache:
            self._cache.move_to_end(cache_key)
            logger.info("SHAP cache hit — modelo %s", model_id)
            return self._cache[cache_key]

        try:
            # Limitar a las primeras _SHAP_MAX_WORDS palabras para mantener latencia acotada
            words = text.split()
            text_for_shap = " ".join(words[:_SHAP_MAX_WORDS]) if len(words) > _SHAP_MAX_WORDS else text

            model = classifier._model
            tokenizer = classifier._tokenizer
            device = classifier._device

            def predict_fn(texts):
                if isinstance(texts, str):
                    texts = [texts]
                texts = [str(t) for t in texts]
                inputs = tokenizer(
                    texts,
                    return_tensors="pt",
                    truncation=True,
                    max_length=512,
                    padding=True
                ).to(device)
                with torch.no_grad():
                    logits = model(**inputs).logits
                probs = torch.softmax(logits, dim=-1).cpu().numpy()
                return probs

            masker = shap.maskers.Text(r"\W+")
            explainer = shap.Explainer(predict_fn, masker, output_names=["REAL", "FALSA"])
            shap_values = explainer([text_for_shap])

            tokens = shap_values.data[0]
            values = shap_values.values[0]

            if len(values.shape) > 1:
                values_fake = values[:, 1]
            else:
                values_fake = values

            valid_indices = [
                i for i, tok in enumerate(tokens)
                if not str(tok).startswith("##")
                and len(str(tok).strip()) > 1
                and any(c.isalpha() for c in str(tok))
            ]

            tokens_filtered = [tokens[i] for i in valid_indices]
            values_filtered = [float(values_fake[i]) for i in valid_indices]

            sorted_pairs = sorted(
                zip(tokens_filtered, values_filtered),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:20]

            result = [
                {"token": tok, "shap_value": round(val, 4), "position": i}
                for i, (tok, val) in enumerate(sorted_pairs)
            ]

            self._cache[cache_key] = result
            if len(self._cache) > _CACHE_MAX:
                self._cache.popitem(last=False)

            return result
        except Exception as e:
            logger.error("Error en SHAP: %s", str(e))
            return []

explainer_service = ExplainerService()
