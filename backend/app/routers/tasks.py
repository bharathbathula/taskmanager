#tasks.py
from fastapi import APIRouter , Depends , HTTPException , status , Response
from sqlalchemy.orm import Session 
from .. import models  , Oauth2
from ..database import get_db
from ..schemas import task

router = APIRouter(
    prefix = "/boards/{board_id}/tasks",
    tags = ["Tasks"]
)


@router.post("/", response_model=task.TaskOut , status_code= status.HTTP_201_CREATED)
def create_task(board_id:int ,task:task.TaskCreate , db:Session = Depends(get_db) , current_user:int= Depends(Oauth2.get_current_user)):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board :
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"Board with id {board_id} not found")
    if board.owner_id != int(current_user.id):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail = f"Not authorized to perform this action")
    new_task = models.Task(**task.model_dump() , board_id = board_id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/", response_model = list[task.TaskOut])
def get_tasks(board_id:int , db:Session = Depends(get_db), current_user:int = Depends(Oauth2.get_current_user) , limit:int =10 , skip :int =0 , search:str=""):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"Board with id {board_id} not found")
    if board.owner_id != int(current_user.id):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail = f"Not authorized to perform this action")
    tasks = db.query(models.Task).filter(models.Task.board_id ==board_id).filter(models.Task.title.contains(search)).limit(limit).offset(skip).all()
    return tasks



@router.get("/{id}", response_model =task.TaskOut)
def get_task(board_id :int ,id :int , db:Session = Depends(get_db), current_user:int = Depends(Oauth2.get_current_user)):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if  not board:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"Board with id {board_id} not found")
    if board.owner_id != int(current_user.id):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail = f"Not authorized to perform this action")
    task = db.query(models.Task).filter(models.Task.id == id).filter(models.Task.board_id == board_id).first()
    if not task:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"Task with id {id} not found in board {board_id}")
    return task

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(board_id:int , id:int , db:Session = Depends(get_db), current_user:int = Depends(Oauth2.get_current_user)):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"Board with id {board_id} not found")
    if board.owner_id != int(current_user.id):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail = f"Not authorized to perform this action")
    task_query = db.query(models.Task).filter(models.Task.id == id).filter(models.Task.board_id == board_id)
    task = task_query.first()
    if not task:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"Task with id {id} not found in board {board_id}")
    task_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.put("/{id}", response_model=task.TaskOut)
def update_task(board_id:int , id:int , updated_task:task.TaskUpdate , db:Session = Depends(get_db), current_user:int = Depends(Oauth2.get_current_user)):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"Board with id {board_id} not found")
    if board.owner_id != int(current_user.id):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail = f"Not authorized to perform this action")
    task_query = db.query(models.Task).filter(models.Task.id == id).filter(models.Task.board_id == board_id)
    task = task_query.first()
    if not task:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"Task with id {id} not found in board {board_id}")
    task_query.update(updated_task.model_dump(), synchronize_session=False)
    db.commit()
    db.refresh(task)
    return task






