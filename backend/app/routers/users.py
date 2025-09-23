from fastapi import APIRouter , Depends , HTTPException , status
from .. import models  
from ..schemas import user  
from sqlalchemy.orm import Session 
from .. import utils
from ..database import get_db

router = APIRouter(
    prefix = "/users",
    tags=["Users"]
)


@router.post("/", response_model=user.UserOut  , status_code=status.HTTP_201_CREATED)
def create_user(user:user.UserCreate , db:Session = Depends(get_db)):
    # check if the use exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code = status.HTTP_400_BAD_REQUEST , detail="Email already registered")
    new_user = models.User(name = user.name , email = user.email , password = user.password)
    new_user.password = utils.hash(new_user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/{id}", response_model=user.UserOut)
def get_user(id:int , db:Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id ).first()
    if not user:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND , detail = f"user with id {id} not found")
    
    return user 


    
