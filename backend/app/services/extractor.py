import logging
import trafilatura
from trafilatura.settings import use_config
from langdetect import detect, LangDetectException

logger = logging.getLogger(__name__)

_fetch_config = use_config()
_fetch_config.set("DEFAULT", "DOWNLOAD_TIMEOUT", "10")


class ExtractorService:
    def extract(self, url: str) -> dict:
        downloaded = trafilatura.fetch_url(url, config=_fetch_config)
        if not downloaded:
            return {"error": f"No se pudo acceder a la URL: {url}"}

        text = trafilatura.extract(downloaded)
        if not text:
            return {"error": "No se pudo extraer contenido legible del artículo"}

        try:
            detected_lang = detect(text)
        except LangDetectException:
            detected_lang = "unknown"

        return {
            "text": text,
            "detected_lang": detected_lang,
            "is_spanish": detected_lang == "es",
            "char_count": len(text),
            "word_count": len(text.split()),
        }


extractor_service = ExtractorService()
