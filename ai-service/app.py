import gradio as gr
from transformers import pipeline
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn

analyzer = pipeline("sentiment-analysis")
app = FastAPI()

def analyze_text(text):
    result = analyzer(text)[0]
    return {"label": result["label"], "score": result["score"]}

@app.post("/analyze")
async def analyze(request: Request):
    data = await request.json()
    text = data.get("text", "")
    result = analyzer(text)[0]
    return JSONResponse(content={"label": result["label"], "score": result["score"]})

iface = gr.Interface(
    fn=analyze_text,
    inputs="text",
    outputs="json",
    title="AI Sentiment Analyzer"
)

def launch():
    import threading
    threading.Thread(target=iface.launch, kwargs={"server_name":"0.0.0.0","server_port":7860,"inline":False}).start()
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    launch()
