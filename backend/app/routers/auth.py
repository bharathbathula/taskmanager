from fastapi import FastAPI , Depends , HTTPException , status , APIRouter
from .. import models , schemas
from sqlalchemy.orm import Session 
from ..database import get_db 
from .. import utils , Oauth2
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(
    tags=["Authentication"]
)


@router.post("/login" , response_model = schemas.user.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db:Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.username).first()
    if not user:
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail="Invalid Credentials")
    if not utils.pwd_context.verify(user_credentials.password , user.password):
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN , detail="Invalid Credentials")
    

    access_token = Oauth2.create_access_token(data ={"user_id" : user.id})

    return {"access_token": access_token, "token_type": "bearer"}