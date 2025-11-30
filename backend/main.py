from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
from typing import List

app = FastAPI()

# CORS: erlaubt Anfragen z.B. von deiner GitHub-Pages-Seite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path("data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

def load_list(name: str) -> list:
    path = DATA_DIR / f"{name}.json"
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def save_list(name: str, items: list) -> None:
    path = DATA_DIR / f"{name}.json"
    with path.open("w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

@app.get("/")
def root():
    return {"message": "Hallo, ich bin dein zukünftiger KI-Assistent 🧠"}

@app.get("/health")
def health():
    return {"status": "ok"}

# Anfrage-Body für /ask
class AskRequest(BaseModel):
    question: str

class TodoItem(BaseModel):
    id: int
    title: str
    done: bool = False

class Note(BaseModel):
    id: int
    content: str

# Antwort der "KI" (noch Dummy)
@app.post("/ask")
def ask(req: AskRequest):
    # Hier später KI + Kalender/ToDos/Notizen einbauen
    return {
        "answer": f"Du hast gefragt: '{req.question}'. "
                  f"Später plane ich damit deine Termine und Aufgaben 🙂"
    }

@app.get("/todos", response_model=List[TodoItem])
def get_todos():
    raw = load_list("todos")
    return [TodoItem(**item) for item in raw]

@app.post("/todos", response_model=TodoItem)
def create_todo(title: str):
    raw = load_list("todos")
    # einfache ID-Generierung
    next_id = max([item["id"] for item in raw], default=0) + 1
    todo = TodoItem(id=next_id, title=title, done=False)
    raw.append(todo.dict())
    save_list("todos", raw)
    return todo