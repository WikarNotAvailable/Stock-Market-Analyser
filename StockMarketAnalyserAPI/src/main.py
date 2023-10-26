from flask import Flask, request
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from src.services.engine_service import get_engine_from_settings, get_session
from src.models.base import Base
from src.models.usertype import Usertype
from src.models.user import User

app = Flask(__name__)
api = Api(app)

session = get_session()
Base.metadata.create_all(get_engine_from_settings(), checkfirst=True)
