from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer
from src.models.base import Base
from typing import List, TYPE_CHECKING
import datetime
from src.models.company_on_stock_market import association_table

if TYPE_CHECKING:
    from src.models.company import Company


class StockMarket(Base):
    __tablename__ = "StockMarkets"

    StockMarketID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    Name: Mapped[str] = mapped_column(String(80))
    Abbreviation: Mapped[str] = mapped_column(String(20))
    Country: Mapped[str] = mapped_column(String(50))
    FoundationDate: Mapped[datetime.date]
    Description: Mapped[str] = mapped_column(String(2000))
    Localization: Mapped[str] = mapped_column(String(150))
    NumberOfCompanies: Mapped[int] = mapped_column(Integer)
    Companies: Mapped[List["Company"]] = relationship(secondary=association_table, back_populates="StockMarkets",
                                                      cascade="all, delete")
