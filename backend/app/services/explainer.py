"""
services/explainer.py — Servicio de explicabilidad post-hoc.

Responsabilidades:
- Implementar explicación basada en SHAP (TextExplainer / Partition explainer)
  usando el pipeline de HuggingFace como función de predicción para SHAP
- Alternativamente, extraer pesos de atención del último bloque del Transformer
- Normalizar y escalar los valores SHAP a rango [-1, 1] para visualización
- Generar HTML con colores de highlighting (verde = pro-REAL, rojo = pro-FAKE)
- Cachear resultados para textos repetidos (opcional, via functools.lru_cache)
"""

# import shap
# import numpy as np
# from transformers import pipeline
# from app.services.classifier import ClassifierService


class ExplainerService:

    @classmethod
    async def explain(cls, text: str, label: str) -> dict:
        """
        Calcula importancia de tokens para la predicción dada.

        Args:
            text:  texto de la noticia
            label: clase predicha ("REAL" o "FAKE")

        Returns:
            {
              tokens: list[{token: str, shap_value: float}],
              html_highlight: str  (HTML listo para renderizar)
            }
        """
        # clf_pipeline = pipeline(
        #     "text-classification",
        #     model=ClassifierService._model,
        #     tokenizer=ClassifierService._tokenizer,
        #     return_all_scores=True,
        # )
        # explainer = shap.Explainer(clf_pipeline)
        # shap_values = explainer([text])
        # ...procesar y devolver tokens con sus valores
        raise NotImplementedError
