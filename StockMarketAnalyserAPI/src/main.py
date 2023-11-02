from flask import Flask
from src.services.engine_service import get_engine_from_settings, get_session
from src.models.base import Base
from src.models.usertype import Usertype
from src.models.user import User
from flask_cors import CORS
from src.controllers.usertypes_controller import construct_usertypes_controller
from src.controllers.users_controller import construct_users_controller

app = Flask(__name__)
CORS(app)

Base.metadata.create_all(get_engine_from_settings(), checkfirst=True)
app.register_blueprint(construct_usertypes_controller(get_engine_from_settings()))
app.register_blueprint(construct_users_controller(get_engine_from_settings()))