from flask import Flask
from flask_jwt_extended import JWTManager
from src.services.engine_service import get_engine_from_settings
from src.models.base import Base
from src.models.company import Company
from src.models.historical_stock_data import HistoricalStockData
from src.models.stock_market import StockMarket
from src.models.company_on_stock_market import association_table
from flask_cors import CORS
from src.controllers.usertypes_controller import construct_usertypes_controller
from src.controllers.users_controller import construct_users_controller
from src.services.auth_service import construct_auth_service
import os

app = Flask(__name__)
app.config.from_mapping(
    SECRET_KEY=os.environ.get('SECRET_KEY'),
    JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY')
)
JWTManager(app)
CORS(app)

Base.metadata.create_all(get_engine_from_settings(), checkfirst=True)
app.register_blueprint(construct_usertypes_controller(get_engine_from_settings()))
app.register_blueprint(construct_users_controller(get_engine_from_settings()))
app.register_blueprint(construct_auth_service(get_engine_from_settings()))
