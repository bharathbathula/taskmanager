from sqlalchemy import Column , Integer , String , DateTime , ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base 
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql.expression import text 


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer , primary_key=True )
    name = Column(String , nullable=False)
    email = Column(String , nullable=False , unique=True)
    password = Column(String , nullable = False )
    created_at = Column(TIMESTAMP(timezone=True) , nullable=False , server_default = text('now()'))

class Board(Base):
    __tablename__ = 'boards'

    id = Column(Integer , primary_key=True)
    title = Column(String , nullable=False )
    description = Column(String , nullable= False)
    created_at = Column(TIMESTAMP(timezone=True) , nullable=False , server_default = text('now()'))
    owner_id = Column(Integer , ForeignKey('users.id' , ondelete='CASCADE') , nullable=False)
    owner = relationship('User')
    tasks = relationship('Task' , backref='board' , cascade='all, delete-orphan')



class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer , primary_key=True )
    title = Column(String , nullable=False) 
    description = Column(String , nullable=False, default="No description provided")
    status = Column(String , nullable=False , default = "To Do")
    priority = Column(String , nullable=False , default = "Medium")
    due_date = Column(DateTime , nullable =True)
    created_at = Column(TIMESTAMP(timezone=True) , nullable=False , server_default = text('now()'))
    board_id = Column(Integer , ForeignKey('boards.id' , ondelete='CASCADE') , nullable=False)
    tags = Column(String, nullable=True, default="")