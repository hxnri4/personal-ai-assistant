from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from pathlib import Path
import json
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   # GET, POST, PATCH, OPTIONS, ...
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
    name: str
    label: Optional[str] = None
    description: Optional[str] = None
    status: str = "open"

class Note(BaseModel):
    id: int
    content: str

class TodoCreate(BaseModel):
    name: str
    label: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "open"
    
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
def create_todo(payload: TodoCreate):
    raw = load_list("todos")
    # einfache ID-Generierung
    next_id = max([item["id"] for item in raw], default=0) + 1
    
    todo_data = {
        "id": next_id,
        "name": payload.name,
        "label": payload.label,
        "description": payload.description,
        "status": payload.status or "open",
    }
    
    raw.append(todo_data)
    
    save_list("todos", raw)
    return TodoItem(**todo_data)

@app.patch("todo/{todo_id}", response_model=TodoItem)
def update_todo_done(todo_id: int, done: bool = Body(..., embed=True)):
    """
    Erwartet JSON: { "done": true } oder { "done": false }
    """
    raw = load_list("todos")
    
    for item in raw:
        if item["id"] == todo_id:
            item["done"] = done
            save_list("todos", raw)
            return TodoItem(**item)
        
    raise HTTPException(status_code=404, detail="Todo not found")