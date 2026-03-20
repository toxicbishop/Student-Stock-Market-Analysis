from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import User
from schemas import UserOut, UserUpdate
from auth_utils import get_current_user
import os
import uuid

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_my_profile(
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.bio is not None:
        current_user.bio = user_data.bio
    if user_data.college is not None:
        current_user.college = user_data.college
    if user_data.profile_photo is not None:
        current_user.profile_photo = user_data.profile_photo

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/me/upload-photo", response_model=UserOut)
async def upload_photo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    filepath = os.path.join("uploads", filename)

    # Save file
    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Update database
    current_user.profile_photo = f"/uploads/{filename}"
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
