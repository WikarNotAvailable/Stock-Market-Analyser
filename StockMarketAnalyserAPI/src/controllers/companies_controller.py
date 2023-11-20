from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.constants.__http_status_codes import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_200_OK, HTTP_404_NOT_FOUND, \
    HTTP_401_UNAUTHORIZED
from src.models.company import Company
from sqlalchemy import select, delete, update, exc
from sqlalchemy.orm import Session
from flask.json import jsonify
import datetime
import yfinance as yf
from src.models.stock_market import StockMarket
from src.services.cache_stock_data_service import save_data_for_company
from src.services.prediction_service import create_model


def construct_companies_controller(engine):
    companies_controller = Blueprint('companies_controller', __name__, url_prefix='/api/v1/companies')

    @companies_controller.post('/')
    @jwt_required()
    def post_company():
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        ticker_symbol = request.get_json().get('TickerSymbol', '')
        name = request.get_json().get('Name', '')
        country = request.get_json().get('Country', '')
        foundation_date = request.get_json().get('FoundationDate', '')
        description = request.get_json().get('Description', '')
        stock_markets_ids = request.get_json().get('StockMarkets', '')

        all_data = yf.download(ticker_symbol, start='2023-01-01', end='2023-01-31')
        if len(all_data) == 0:
            return jsonify({
                'error': 'Data for company of such ticker symbol was not found'
            }), HTTP_404_NOT_FOUND

        try:
            datetime.date.fromisoformat(foundation_date)
        except ValueError:
            return jsonify({
                'error': 'Invalid date'
            }), HTTP_400_BAD_REQUEST

        company = Company(TickerSymbol=ticker_symbol, Name=name, Country=country,
                          FoundationDate=foundation_date, Description=description)
        stock_markets_tuples = []

        with Session(engine) as session:
            with session.begin():
                try:
                    for stock_market_id in stock_markets_ids:
                        stock_market = session.execute(select(StockMarket)
                                                       .where(StockMarket.StockMarketID == stock_market_id)).scalar()
                        if stock_market is None:
                            return jsonify({
                                'error': 'Stock market with passed id was not found in database'
                            }), HTTP_404_NOT_FOUND
                        stock_market.Companies.append(company)
                        stock_markets_tuples.append(({"Name": stock_market.Name, "ID": stock_market.StockMarketID}))

                    session.add(company)
                    session.commit()
                except exc.IntegrityError as error:
                    session.rollback()
                    if "UniqueViolation" in str(error):
                        if 'Key ("TickerSymbol")' in str(error):
                            return jsonify({
                                'error': 'Ticker symbol already exists in database'
                            }), HTTP_400_BAD_REQUEST
                    else:
                        raise Exception(str(error))
            session.refresh(company)

        save_data_for_company(company.CompanyID, company.TickerSymbol, engine)
        create_model(ticker_symbol)
        return jsonify({
            'CompanyID': company.CompanyID, 'TickerSymbol': company.TickerSymbol, 'Country': company.Country,
            'FoundationDate': company.FoundationDate, 'Description': company.Description,
            'StockMarkets': stock_markets_tuples
        }), HTTP_201_CREATED

    @companies_controller.get('/')
    def get_all_companies():
        stmt = select(Company)

        with Session(engine) as session:
            companies = session.execute(stmt).scalars().all()

            data = []
            for company in companies:
                stock_markets_tuples = []
                for stock_market in company.StockMarkets:
                    stock_markets_tuples.append(({"Name": stock_market.Name, "ID": stock_market.StockMarketID}))

                data.append(
                    {'CompanyID': company.CompanyID, 'TickerSymbol': company.TickerSymbol, 'Country': company.Country,
                     'FoundationDate': company.FoundationDate, 'Description': company.Description,
                     'StockMarkets': stock_markets_tuples})

            return jsonify({
                'companies': {'data': data}
            }), HTTP_200_OK

    @companies_controller.get('/<int:id>')
    def get_company(id):
        stmt = select(Company).where(Company.CompanyID == id)

        with Session(engine) as session:
            company = session.execute(stmt).scalar()
            if company is None:
                return jsonify({
                    'error': 'Company with passed id was not found in database'
                }), HTTP_404_NOT_FOUND

            stock_markets_tuples = []
            for stock_market in company.StockMarkets:
                stock_markets_tuples.append(({"Name": stock_market.Name, "ID": stock_market.StockMarketID}))

        return jsonify({
            'CompanyID': company.CompanyID, 'TickerSymbol': company.TickerSymbol, 'Country': company.Country,
            'FoundationDate': company.FoundationDate, 'Description': company.Description,
            'StockMarkets': stock_markets_tuples
        }), HTTP_200_OK

    @companies_controller.delete('/<int:id>')
    @jwt_required()
    def delete_company(id):
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        item = get_company(id)
        if item[1] is HTTP_404_NOT_FOUND:
            return item

        stmt = delete(Company).where(Company.CompanyID == id)

        with Session(engine) as session:
            session.execute(stmt)
            session.commit()

        return jsonify({
            'response': "deleted"
        }), HTTP_200_OK

    @companies_controller.put('/<int:id>')
    @jwt_required()
    def update_company(id):
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        select_stmt = select(Company).where(Company.CompanyID == id)

        with Session(engine) as session:
            old_company = session.execute(select_stmt).scalar()
            if old_company is None:
                return jsonify({
                    'error': 'Company with passed id was not found in database'
                }), HTTP_404_NOT_FOUND

        ticker_symbol = request.get_json().get('TickerSymbol', '')
        name = request.get_json().get('Name', '')
        country = request.get_json().get('Country', '')
        foundation_date = request.get_json().get('FoundationDate', '')
        description = request.get_json().get('Description', '')
        stock_markets_ids = request.get_json().get('StockMarkets', '')

        ticker_symbol = old_company.TickerSymbol if not ticker_symbol else ticker_symbol
        name = old_company.Name if not name else name
        country = old_company.Country if not country else country
        description = old_company.Description if not description else description

        if not foundation_date:
            foundation_date = old_company.FoundationDate
        else:
            try:
                datetime.date.fromisoformat(foundation_date)
            except ValueError:
                return jsonify({
                    'error': 'Invalid date'
                }), HTTP_400_BAD_REQUEST

        update_stmt = update(Company).where(Company.CompanyID == id).values(TickerSymbol=ticker_symbol,
                                                                            Name=name,
                                                                            Country=country,
                                                                            FoundationDate=foundation_date,
                                                                            Description=description)
        stock_markets_tuples = []

        with Session(engine) as session:
            try:
                if stock_markets_ids:
                    company = session.execute(select(Company).where(Company.CompanyID == id)).scalar()

                    for stock_market in company.StockMarkets[:]:
                        stock_market.Companies.remove(company)

                    for stock_market_id in stock_markets_ids:
                        stock_market = session.execute(select(StockMarket)
                                                       .where(StockMarket.StockMarketID == stock_market_id)).scalar()
                        if stock_market is None:
                            session.rollback()
                            return jsonify({
                                'error': 'Stock market with passed id was not found in database'
                            }), HTTP_404_NOT_FOUND

                        stock_market.Companies.append(company)
                        stock_markets_tuples.append(({"Name": stock_market.Name, "ID": stock_market.StockMarketID}))

                session.execute(update_stmt)
                session.commit()
            except exc.IntegrityError as error:
                session.rollback()
                if "UniqueViolation" in str(error):
                    if 'Key ("TickerSymbol")' in str(error):
                        return jsonify({
                            'error': 'Ticker symbol already exists in database'
                        }), HTTP_400_BAD_REQUEST
                else:
                    raise Exception(str(error))

        return jsonify({
            'CompanyID': id, 'TickerSymbol': ticker_symbol, 'Country': country, 'FoundationDate': foundation_date,
            'Description': description, 'StockMarkets': stock_markets_tuples
        }), HTTP_200_OK

    return companies_controller
