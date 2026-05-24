from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import string
import random
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url_db = {}

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

class URLItem(BaseModel):
    url: HttpUrl

# Ensure static directory exists
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return FileResponse("static/index.html")

@app.post("/api/shorten")
async def shorten_url(item: URLItem, request: Request):
    original_url = str(item.url)
    short_code = generate_short_code()
    while short_code in url_db:
        short_code = generate_short_code()
    
    url_db[short_code] = original_url
    
    base_url = str(request.base_url)
    short_url = f"{base_url}{short_code}"
    
    return {"short_url": short_url, "short_code": short_code, "original_url": original_url}

@app.get("/{short_code}")
async def redirect_to_url(short_code: str):
    if short_code in url_db:
        return RedirectResponse(url_db[short_code])
    raise HTTPException(status_code=404, detail="Short URL not found")

