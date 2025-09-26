# tasks.py - Fixed version
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session 
from .. import models, Oauth2
from ..database import get_db
from ..schemas import task
from datetime import datetime
from typing import Optional

router = APIRouter(
    prefix="/boards/{board_id}/tasks",
    tags=["Tasks"]
)


@router.post("/", response_model=task.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    board_id: int, 
    task_data: task.TaskCreate, 
    db: Session = Depends(get_db), 
    current_user: int = Depends(Oauth2.get_current_user)
):
    """Create a new task in a specific board"""
    # Check if board exists and user owns it
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Board with id {board_id} not found"
        )
    
    if board.owner_id != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to perform this action"
        )
    
    # Convert due_date string to datetime if provided
    task_dict = task_data.model_dump()
    if task_dict.get('due_date'):
        try:
            # Handle date format from frontend (YYYY-MM-DD)
            if isinstance(task_dict['due_date'], str):
                task_dict['due_date'] = datetime.strptime(task_dict['due_date'], '%Y-%m-%d')
        except ValueError:
            task_dict['due_date'] = None
    
    # Create new task
    new_task = models.Task(**task_dict, board_id=board_id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return new_task


@router.get("/", response_model=list[task.TaskOut])
def get_tasks(
    board_id: int, 
    db: Session = Depends(get_db), 
    current_user: int = Depends(Oauth2.get_current_user), 
    limit: int = 100, 
    skip: int = 0, 
    search: Optional[str] = ""
):
    """Get all tasks from a specific board"""
    # Check if board exists and user owns it
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Board with id {board_id} not found"
        )
    
    if board.owner_id != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to perform this action"
        )
    
    # Build query for tasks
    query = db.query(models.Task).filter(models.Task.board_id == board_id)
    
    # Apply search filter if provided
    if search:
        query = query.filter(
            models.Task.title.contains(search) | 
            models.Task.description.contains(search)
        )
    
    # Apply pagination
    tasks = query.order_by(models.Task.created_at.desc()).limit(limit).offset(skip).all()
    
    return tasks


@router.get("/{id}", response_model=task.TaskOut)
def get_task(
    board_id: int, 
    id: int, 
    db: Session = Depends(get_db), 
    current_user: int = Depends(Oauth2.get_current_user)
):
    """Get a specific task by ID"""
    # Check if board exists and user owns it
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Board with id {board_id} not found"
        )
    
    if board.owner_id != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to perform this action"
        )
    
    # Get the specific task
    task_obj = db.query(models.Task).filter(
        models.Task.id == id, 
        models.Task.board_id == board_id
    ).first()
    
    if not task_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Task with id {id} not found in board {board_id}"
        )
    
    return task_obj


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    board_id: int, 
    id: int, 
    db: Session = Depends(get_db), 
    current_user: int = Depends(Oauth2.get_current_user)
):
    """Delete a specific task"""
    # Check if board exists and user owns it
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Board with id {board_id} not found"
        )
    
    if board.owner_id != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to perform this action"
        )
    
    # Find and delete the task
    task_query = db.query(models.Task).filter(
        models.Task.id == id, 
        models.Task.board_id == board_id
    )
    task_obj = task_query.first()
    
    if not task_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Task with id {id} not found in board {board_id}"
        )
    
    task_query.delete(synchronize_session=False)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/{id}", response_model=task.TaskOut)
def update_task(
    board_id: int, 
    id: int, 
    updated_task: task.TaskUpdate, 
    db: Session = Depends(get_db), 
    current_user: int = Depends(Oauth2.get_current_user)
):
    """Update a specific task"""
    # Check if board exists and user owns it
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Board with id {board_id} not found"
        )
    
    if board.owner_id != int(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to perform this action"
        )
    
    # Find the task to update
    task_query = db.query(models.Task).filter(
        models.Task.id == id, 
        models.Task.board_id == board_id
    )
    task_obj = task_query.first()
    
    if not task_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Task with id {id} not found in board {board_id}"
        )
    
    # Prepare update data
    update_dict = updated_task.model_dump(exclude_unset=True)
    
    # Handle due_date conversion if provided
    if 'due_date' in update_dict and update_dict['due_date']:
        try:
            if isinstance(update_dict['due_date'], str):
                update_dict['due_date'] = datetime.strptime(update_dict['due_date'], '%Y-%m-%d')
        except ValueError:
            update_dict['due_date'] = None
    
    # Update the task
    task_query.update(update_dict, synchronize_session=False)
    db.commit()
    
    # Refresh to get updated task
    db.refresh(task_obj)
    
    return task_obj