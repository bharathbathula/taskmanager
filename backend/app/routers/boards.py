from fastapi import APIRouter , Depends , HTTPException , status , Response
from .. import models , Oauth2
from ..schemas import board 
from sqlalchemy.orm import Session 
from ..database import get_db



router = APIRouter(
    prefix ="/boards",
    tags = ["Boards"]
)


@router.post("/" , response_model=board.BoardOut , status_code=status.HTTP_201_CREATED)
def create_board(board:board.BoardCreate , db:Session = Depends(get_db), current_user: int = Depends(Oauth2.get_current_user)):
    new_board = models.Board(**board.model_dump(), owner_id=current_user.id)
    db.add(new_board)
    db.commit()
    db.refresh(new_board)
    return new_board


@router.get("/" , response_model = list[board.BoardOut])
def get_boards(db:Session = Depends(get_db), current_user:int = Depends(Oauth2.get_current_user) , limit:int = 10 , skip:int = 0 , search :str =""):
    boards = db.query(models.Board).filter(models.Board.owner_id == current_user.id).filter(models.Board.title.contains(search)).limit(limit).offset(skip).all()
    return boards

@router.get("/{id}" , response_model=board.BoardOut)
def get_board(id:int , db:Session = Depends(get_db) , current_user:int = Depends(Oauth2.get_current_user)):
    board = db.query(models.Board).filter(models.Board.id ==id).first()
    if not board:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"board with id {id} not found")
    if board.owner_id != int(current_user.id):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail = f"Not authorized to perform this action")
    return board

@router.delete("/{id}" , status_code=status.HTTP_204_NO_CONTENT)
def delete_board(id:int , db:Session = Depends(get_db) , current_user:int = Depends(Oauth2.get_current_user)):
    board_query = db.query(models.Board).filter(models.Board.id == id)
    board = board_query.first()
    if not board:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"board with id {id} not found")
    
    if board.owner_id != int(current_user.id):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail = f"Not authorized to perform this action")

    board_query.delete(synchronize_session=False)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.put("/{id}" , response_model=board.BoardOut)
def update_board(id:int , updated_board:board.BoardUpdate , db:Session = Depends(get_db), current_user :int = Depends(Oauth2.get_current_user)):
    board_query = db.query(models.Board).filter(models.Board.id== id )
    board = board_query.first()
    if not board:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"board with id {id} not found")
    if board.owner_id != int(current_user.id):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail = f"Not authorized to perform this action")
    board_query.update(updated_board.model_dump(), synchronize_session=False)
    db.commit()
    db.refresh(board)
    return board