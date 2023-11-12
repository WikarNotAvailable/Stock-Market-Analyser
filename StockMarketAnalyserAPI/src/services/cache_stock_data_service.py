from src.models.company import Company
from sqlalchemy import select, exc
from sqlalchemy.orm import Session
from src.models.historical_stock_data import HistoricalStockData
from datetime import date, timedelta
import yfinance as yf


# Fetched row columns order: Date Open High Low Close AdjClose Volume
def save_data_for_company(company_id, ticker_symbol, engine):
    all_data = yf.download(ticker_symbol, start='2002-10-01', end=date.today()).reset_index().values.tolist()

    with Session(engine) as session:
        for one_day_data in all_data:
            data_object = HistoricalStockData(Date=one_day_data[0], Open=one_day_data[1], High=one_day_data[2],
                                              Low=one_day_data[3], Close=one_day_data[4], AdjClose=one_day_data[5],
                                              Volume=one_day_data[6], CompanyID=company_id)
            session.add(data_object)
            session.commit()


def update_data_for_companies(engine):
    company_select_stmt = select(Company.CompanyID, Company.TickerSymbol)

    with Session(engine) as session:
        companies = session.execute(company_select_stmt).all()

        for company in companies:
            recent_data_stmt = select(HistoricalStockData.Date).order_by(HistoricalStockData.Date.desc()).where(
                HistoricalStockData.CompanyID == company[0])
            recent_data = session.execute(recent_data_stmt).first()

            all_data = yf.download(company[1], start=recent_data[0] + timedelta(days=1), end=date.today())

            if len(all_data) == 0:
                print(f'There is no new data for company, ticker symbol: {company[1]}')
            else:
                for one_day_data in all_data.reset_index().values.tolist():
                    data_object = HistoricalStockData(Date=one_day_data[0], Open=one_day_data[1], High=one_day_data[2],
                                                      Low=one_day_data[3], Close=one_day_data[4],
                                                      AdjClose=one_day_data[5],
                                                      Volume=one_day_data[6], CompanyID=company[0])
                    try:
                        session.add(data_object)
                        session.commit()
                    except exc.IntegrityError as error:
                        session.rollback()
                        if "UniqueViolation" in str(error):
                            print(f'Already added data, ticker symbol: {company[1]}, date: {one_day_data[0]}')
                        else:
                            raise Exception(str(error))
