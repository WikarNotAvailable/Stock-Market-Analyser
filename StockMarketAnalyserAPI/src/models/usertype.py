from sqlalchemy.orm import Mapped, relationship, mapped_column
from src.models.base import Base
from src.models.user import User
from sqlalchemy import String
from typing import List


class Usertype(Base):
    __tablename__ = "Usertypes"

    UsertypeID: Mapped[int] = mapped_column(primary_key=True)
    Usertype: Mapped[str] = mapped_column(String(30))
    User: Mapped[List["User"]] = relationship()
