from sqlalchemy import ForeignKey, Column, Table
from src.models.base import Base

association_table = Table(
    "CompaniesOnStockMarkets",
    Base.metadata,
    Column("CompanyID", ForeignKey("Companies.CompanyID", ondelete="CASCADE"), primary_key=True),
    Column("StockMarketID", ForeignKey("StockMarkets.StockMarketID", ondelete="CASCADE"), primary_key=True),
)
