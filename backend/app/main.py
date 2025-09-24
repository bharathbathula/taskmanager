from fastapi import FastAPI
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware


from . import models
from .database import engine , get_db
from sqlalchemy.orm import Session
from .routers import users , boards , tasks ,auth

app  = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "https://taskmanager-o1tb.onrender.com"],  # allow your frontend url
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

#models.Base.metadata.create_all(bind = engine)


app.include_router(users.router)
app.include_router(boards.router)
app.include_router(auth.router)
app.include_router(tasks.router)



@app.get("/")
def root():
    return {"message": "Hello , World!"}