"""
services/extractor.py — Servicio de extracción de texto desde URL.

Responsabilidades:
- Descargar y parsear el contenido principal de una URL con trafilatura
- Eliminar boilerplate (menús, sidebars, footers) automáticamente
- Detectar idioma del texto extraído con langdetect
- Rechazar contenido no español con error descriptivo
- Devolver metadata estructurada: título, texto, autor, fecha
"""

# import trafilatura
# from langdetect import detect, LangDetectException
# from fastapi import HTTPException


class ExtractorService:

    @classmethod
    async def extract(cls, url: str) -> dict:
        """
        Descarga y limpia el contenido de la URL.

        Args:
            url: URL del artículo periodístico

        Returns:
            {title, text, author, published_date, language}

        Raises:
            HTTPException 400 si no se puede extraer texto o no es español
        """
        # downloaded = trafilatura.fetch_url(url)
        # if not downloaded:
        #     raise HTTPException(status_code=400, detail="No se pudo acceder a la URL")
        #
        # result = trafilatura.extract(
        #     downloaded,
        #     include_metadata=True,
        #     output_format="json",
        #     with_metadata=True,
        # )
        # if not result:
        #     raise HTTPException(status_code=400, detail="No se pudo extraer contenido")
        #
        # data = json.loads(result)
        # lang = detect(data.get("text", ""))
        # if lang != "es":
        #     raise HTTPException(status_code=400, detail=f"Idioma detectado: {lang}. Solo se admite español.")
        #
        # return {
        #     "title": data.get("title"),
        #     "text": data.get("text"),
        #     "author": data.get("author"),
        #     "published_date": data.get("date"),
        #     "language": lang,
        # }
        raise NotImplementedError
