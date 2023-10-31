from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey
from src.models.base import Base
import datetime

class User(Base):
    __tablename__ = "Users"

    UserID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    Nickname: Mapped[str] = mapped_column(String(30))
    Email: Mapped[str] = mapped_column(String(40))
    PhoneNumber: Mapped[str] = mapped_column(String(50))
    BirthDate: Mapped[datetime.date]
    UsertypeID: Mapped[int] = mapped_column(ForeignKey("Usertypes.UsertypeID"))