from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🔓 CORS: erlaubt Anfragen z.B. von deiner GitHub-Pages-Seite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # für Entwicklung ok, später kannst du es einschränken
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hallo, ich bin dein zukünftiger KI-Assistent 🧠"}

@app.get("/health")
def health():
    return {"status": "ok"}

# Anfrage-Body für /ask
class AskRequest(BaseModel):
    question: str

# Antwort der "KI" (noch Dummy)
@app.post("/ask")
def ask(req: AskRequest):
    # Hier später KI + Kalender/ToDos/Notizen einbauen
    return {
        "answer": f"Du hast gefragt: '{req.question}'. "
                  f"Später plane ich damit deine Termine und Aufgaben 🙂"
    }