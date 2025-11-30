from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hallo, ich bin dein zukünftiger KI-Assistent 🧠"}

@app.get("/health")
def health():
    return {"status": "ok"}
