"""
routers/extract.py — Endpoint de extracción de contenido desde URL.

Responsabilidades:
- Recibir una URL de artículo periodístico
- Delegar en ExtractorService (trafilatura) para obtener texto limpio
- Detectar idioma con langdetect y rechazar textos no españoles
- Devolver: título, texto, autor, fecha de publicación (si están disponibles)
"""

from fastapi import APIRouter

# from app.services.extractor import ExtractorService
# from app.models.schemas import ExtractRequest, ExtractResponse

router = APIRouter()


# @router.post("/", response_model=ExtractResponse)
# async def extract(request: ExtractRequest):
#     """
#     Extrae el contenido legible de una URL de noticia.
#
#     Body:
#         url (str): URL del artículo
#
#     Returns:
#         ExtractResponse con title, text, author, published_date, language
#
#     Raises:
#         400 si la URL no es accesible o el idioma detectado no es español
#     """
#     result = await ExtractorService.extract(str(request.url))
#     return result
