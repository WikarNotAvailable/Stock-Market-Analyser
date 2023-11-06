from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String
from src.models.base import Base
from typing import List, TYPE_CHECKING
import datetime
from src.models.company_on_stock_market import association_table
from src.models.historical_stock_data import HistoricalStockData

if TYPE_CHECKING:
    from src.models.stock_market import StockMarket


class Company(Base):
    __tablename__ = "Companies"

    CompanyID: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    TickerSymbol: Mapped[str] = mapped_column(String(10), unique=True)
    Name: Mapped[str] = mapped_column(String(80))
    Country: Mapped[str] = mapped_column(String(50))
    FoundationDate: Mapped[datetime.date]
    Description: Mapped[str] = mapped_column(String(2000))
    StockMarkets: Mapped[List["StockMarket"]] = relationship(secondary=association_table, back_populates="Companies",
                                                             cascade="all, delete")
    HistoricalStockData: Mapped[List["HistoricalStockData"]] = relationship(passive_deletes=True)
