from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, UniqueConstraint
from src.models.base import Base
import datetime


class HistoricalStockData(Base):
    __tablename__ = "HistoricalStockData"
    __table_args__ = (UniqueConstraint("CompanyID", "Date"),)

    DataID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    Date: Mapped[datetime.date]
    Close: Mapped[float]
    Open: Mapped[float]
    AdjClose: Mapped[float]
    Volume: Mapped[float]
    Low: Mapped[float]
    High: Mapped[float]
    CompanyID: Mapped[int] = mapped_column(ForeignKey("Companies.CompanyID", ondelete="CASCADE"))
