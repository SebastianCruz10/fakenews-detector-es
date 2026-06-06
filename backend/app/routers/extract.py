from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.extractor import extractor_service

router = APIRouter()


class ExtractRequest(BaseModel):
    url: str


class ExtractResponse(BaseModel):
    text: str
    detected_lang: str
    is_spanish: bool
    char_count: int
    word_count: int


@router.post("/extract", response_model=ExtractResponse)
async def extract(request: ExtractRequest):
    if not request.url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=400,
            detail="La URL debe comenzar con http:// o https://",
        )
    result = extractor_service.extract(request.url)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
