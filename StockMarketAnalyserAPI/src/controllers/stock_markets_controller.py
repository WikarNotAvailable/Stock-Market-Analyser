from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.constants.__http_status_codes import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_200_OK, HTTP_401_UNAUTHORIZED
from src.models.stock_market import StockMarket
from sqlalchemy import select, delete, update
from sqlalchemy.orm import Session
from flask.json import jsonify
import datetime


def construct_stock_markets_controller(engine):
    stock_markets_controller = Blueprint('stock_markets_controller', __name__, url_prefix='/api/v1/stock-markets')

    @stock_markets_controller.post('/')
    @jwt_required()
    def post_stock_market():
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        name = request.get_json().get('Name', '')
        abbreviation = request.get_json().get('Abbreviation', '')
        country = request.get_json().get('Country', '')
        foundation_date = request.get_json().get('FoundationDate', '')
        description = request.get_json().get('Description', '')
        localization = request.get_json().get('Localization', '')
        number_of_companies = request.get_json().get('NumberOfCompanies', '')

        try:
            datetime.date.fromisoformat(foundation_date)
        except ValueError:
            return jsonify({
                'error': 'Invalid date'
            }), HTTP_400_BAD_REQUEST

        stock_market = StockMarket(Name=name, Abbreviation=abbreviation, Country=country,
                                   FoundationDate=foundation_date, Description=description, Localization=localization,
                                   NumberOfCompanies=number_of_companies)

        with Session(engine) as session:
            with session.begin():
                session.add(stock_market)
                session.commit()
            session.refresh(stock_market)

        return jsonify({
            'StockMarketID': stock_market.StockMarketID, 'Name': stock_market.Name,
            'Abbreviation': stock_market.Abbreviation, 'Country': stock_market.Country,
            'FoundationDate': stock_market.FoundationDate, 'Description': stock_market.Description,
            'Localization': stock_market.Localization, 'NumberOfCompanies': stock_market.NumberOfCompanies
        }), HTTP_201_CREATED

    @stock_markets_controller.get('/')
    def get_all_stock_markets():
        stmt = select(StockMarket)

        with Session(engine) as session:
            stock_markets = session.execute(stmt).scalars().all()

            data = []
            for stock_market in stock_markets:
                data.append({'StockMarketID': stock_market.StockMarketID, 'Name': stock_market.Name,
                             'Abbreviation': stock_market.Abbreviation, 'Country': stock_market.Country,
                             'FoundationDate': stock_market.FoundationDate, 'Description': stock_market.Description,
                             'Localization': stock_market.Localization,
                             'NumberOfCompanies': stock_market.NumberOfCompanies})

            return jsonify({
                'stock_markets': {'data': data}
            }), HTTP_200_OK

    @stock_markets_controller.get('/<int:id>')
    def get_stock_market(id):
        stmt = select(StockMarket).where(StockMarket.StockMarketID == id)

        with Session(engine) as session:
            stock_market = session.execute(stmt).scalar()
            if stock_market is None:
                return jsonify({
                    'error': 'Stock market with passed id was not found in database'
                }), HTTP_400_BAD_REQUEST

        return jsonify({
            'StockMarketID': stock_market.StockMarketID, 'Name': stock_market.Name,
            'Abbreviation': stock_market.Abbreviation, 'Country': stock_market.Country,
            'FoundationDate': stock_market.FoundationDate, 'Description': stock_market.Description,
            'Localization': stock_market.Localization, 'NumberOfCompanies': stock_market.NumberOfCompanies
        }), HTTP_200_OK

    @stock_markets_controller.delete('/<int:id>')
    @jwt_required()
    def delete_stock_market(id):
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        item = get_stock_market(id)
        if item[1] is HTTP_400_BAD_REQUEST:
            return item

        stmt = delete(StockMarket).where(StockMarket.StockMarketID == id)

        with Session(engine) as session:
            session.execute(stmt)
            session.commit()

        return jsonify({
            'response': "deleted"
        }), HTTP_200_OK

    @stock_markets_controller.put('/<int:id>')
    @jwt_required()
    def update_stock_market(id):
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        stmt = select(StockMarket).where(StockMarket.StockMarketID == id)

        with Session(engine) as session:
            stock_market = session.execute(stmt).scalar()
            if stock_market is None:
                return jsonify({
                    'error': 'Stock market with passed id was not found in database'
                }), HTTP_400_BAD_REQUEST

        name = request.get_json().get('Name', '')
        abbreviation = request.get_json().get('Abbreviation', '')
        country = request.get_json().get('Country', '')
        foundation_date = request.get_json().get('FoundationDate', '')
        description = request.get_json().get('Description', '')
        localization = request.get_json().get('Localization', '')
        number_of_companies = request.get_json().get('NumberOfCompanies', '')

        name = stock_market.Name if not name else name
        abbreviation = stock_market.Abbreviation if not abbreviation else abbreviation
        country = stock_market.Country if not country else country
        description = stock_market.Description if not description else description
        localization = stock_market.Localization if not localization else localization
        number_of_companies = stock_market.NumberOfCompanies if not number_of_companies else number_of_companies

        if not foundation_date:
            foundation_date = stock_market.FoundationDate
        else:
            try:
                datetime.date.fromisoformat(foundation_date)
            except ValueError:
                return jsonify({
                    'error': 'Invalid date'
                }), HTTP_400_BAD_REQUEST

        stmt = update(StockMarket).where(StockMarket.StockMarketID == id).values(Name=name, Abbreviation=abbreviation,
                                                                                 Country=country,
                                                                                 FoundationDate=foundation_date,
                                                                                 Description=description,
                                                                                 Localization=localization,
                                                                                 NumberOfCompanies=number_of_companies)

        with Session(engine) as session:
            session.execute(stmt)
            session.commit()

        return jsonify({
            'StockMarketID': stock_market.StockMarketID, 'Name': name, 'Abbreviation': abbreviation, 'Country': country,
            'FoundationDate': foundation_date, 'Description': description, 'Localization': localization,
            'NumberOfCompanies': number_of_companies
        }), HTTP_200_OK

    return stock_markets_controller
