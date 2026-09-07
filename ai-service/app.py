import os

import gradio as gr
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel, Field
from transformers import pipeline

# MODEL ACIKCA BELIRTILIYOR.
#
# Onceden yalnizca pipeline("sentiment-analysis") yaziyordu.
# Model adi verilmediginde transformers kendi varsayilanini secer ve
# bu varsayilan KUTUPHANE SURUMUNE GORE DEGISEBILIR. Yani bugun
# calisan kurulum, birkac ay sonra baska bir model indirip baska
# sonuclar uretebilirdi. Adi yazmak sonucu tekrarlanabilir kilar.
#
# Ortam degiskeniyle degistirilebilir; ornegin Turkce icin farkli
# bir model denemek istersen kodu degistirmen gerekmez.
MODEL_NAME = os.getenv(
    "SENTIMENT_MODEL",
    "distilbert-base-uncased-finetuned-sst-2-english",
)

# Metin uzunlugu siniri: model zaten uzun metinleri kirpar ama
# sinirsiz girdi kabul etmek gereksiz bellek ve islem demektir.
MAX_TEXT_LENGTH = 2000

analyzer = pipeline("sentiment-analysis", model=MODEL_NAME)

app = FastAPI(
    title="AI Sentiment Service",
    description="Metnin duygu durumunu (POSITIVE/NEGATIVE) dondurur.",
)


class AnalyzeRequest(BaseModel):
    """Istek govdesi.

    Onceden govde elle ayristiriliyordu:
        data = await request.json()
        text = data.get("text", "")

    Bu, gecersiz JSON'da islenmemis bir istisna uretiyor ve bos metni
    sessizce kabul ediyordu. Pydantic modeli her ikisini de cozer:
    bicim bozuksa FastAPI kendiliginden 422 doner.
    """

    text: str = Field(min_length=1, max_length=MAX_TEXT_LENGTH)


def analyze_text(text: str) -> dict:
    """Gradio arayuzu ve HTTP endpoint'i AYNI fonksiyonu kullanir.

    Onceden analiz mantigi iki yerde ayri ayri yaziliydi; biri
    degistiginde digeri geride kalirdi.
    """
    if not text or not text.strip():
        return {"label": "unknown", "score": 0.0}

    result = analyzer(text[:MAX_TEXT_LENGTH])[0]
    return {"label": result["label"], "score": float(result["score"])}


@app.get("/health")
def health() -> dict:
    """Servisin ayakta oldugunu ve hangi modeli kullandigini soyler.

    .NET tarafi (ChatController) bu servise baglaniyor; bir sorun
    oldugunda "servis mi kapali, model mi farkli?" sorusunu
    cevaplayabilmek icin ucuz bir kontrol noktasi.
    """
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/analyze")
def analyze(request: AnalyzeRequest) -> dict:
    return analyze_text(request.text)


iface = gr.Interface(
    fn=analyze_text,
    inputs="text",
    outputs="json",
    title="AI Sentiment Analyzer",
)


def launch() -> None:
    """Gradio arayuzunu ve HTTP API'yi birlikte calistirir.

    Gradio ayri bir is parcaciginda; uvicorn ana is parcaciginda
    calisiyor ki Ctrl+C ile duzgun kapanabilsin.

    Adresler ortam degiskenleriyle ayarlanabilir. Varsayilan
    127.0.0.1: onceden 0.0.0.0 yaziyordu, yani servis AYNI AGDAKI
    HERKESE aciliyordu. Yerel gelistirme icin buna gerek yok;
    konteyner icinde calistirirken HOST=0.0.0.0 vermek yeterli.
    """
    import threading

    host = os.getenv("HOST", "127.0.0.1")
    api_port = int(os.getenv("PORT", "8000"))
    ui_port = int(os.getenv("GRADIO_PORT", "7860"))

    threading.Thread(
        target=iface.launch,
        kwargs={"server_name": host, "server_port": ui_port, "inline": False},
        daemon=True,  # ana surec bitince bu parcacik da bitsin
    ).start()

    uvicorn.run(app, host=host, port=api_port)


if __name__ == "__main__":
    launch()
