from flask import Blueprint, request
from src.constants.__http_status_codes import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_200_OK, HTTP_401_UNAUTHORIZED
from src.models.user import User
from src.models.usertype import Usertype
from sqlalchemy import exc, select
from sqlalchemy.orm import Session
from flask.json import jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token, get_jwt_identity
import phonenumbers
import validators
import datetime


def construct_auth_service(engine):
    auth_service = Blueprint('auth_service', __name__, url_prefix='/api/v1/auth')

    @auth_service.post('/register')
    @jwt_required(optional=True)
    def register():
        user_identity = get_jwt_identity()
        if user_identity is not None and user_identity.get('usertype') == "Admin":
            usertype_id = request.get_json().get('UsertypeID')
        else:
            usertype_id = 1

        nickname = request.get_json().get('Nickname', '')
        email = request.get_json().get('Email', '')
        phone_number = request.get_json().get('PhoneNumber', '')
        birth_date = request.get_json().get('BirthDate', '')
        password = request.get_json().get('Password', '')

        if len(nickname) < 3:
            return jsonify({'error': "Nickname is too short"}), HTTP_400_BAD_REQUEST
        elif len(nickname) > 30:
            return jsonify({'error': "Nickname is too long"}), HTTP_400_BAD_REQUEST

        if not validators.email(email):
            return jsonify({'error': "Email is not valid"}), HTTP_400_BAD_REQUEST

        if phonenumbers.is_possible_number(phonenumbers.parse(phone_number)) is False:
            return jsonify({'error': "Phone number is not valid"}), HTTP_400_BAD_REQUEST

        try:
            datetime.date.fromisoformat(birth_date)
        except ValueError:
            return jsonify({
                'error': 'Invalid date'
            }), HTTP_400_BAD_REQUEST

        if len(password) < 3:
            return jsonify({'error': "Password is too short"}), HTTP_400_BAD_REQUEST

        pwd_hash = generate_password_hash(password)

        user = User(Nickname=nickname, Email=email, PhoneNumber=phone_number, BirthDate=birth_date, Password=pwd_hash,
                    UsertypeID=usertype_id)

        with Session(engine) as session:
            with session.begin():
                try:
                    session.add(user)
                    session.commit()
                except exc.IntegrityError as error:
                    session.rollback()
                    if "UniqueViolation" in str(error):
                        if 'Key ("Nickname")' in str(error):
                            return jsonify({
                                'error': 'Nickname already exists in database'
                            }), HTTP_400_BAD_REQUEST
                        elif 'Key ("Email")' in str(error):
                            return jsonify({
                                'error': 'Email already exists in database'
                            }), HTTP_400_BAD_REQUEST
                        else:
                            return jsonify({
                                'error': 'Phone humber already exists in database'
                            }), HTTP_400_BAD_REQUEST
                    else:
                        raise Exception(str(error))
            session.refresh(user)
            usertype = session.get(Usertype, user.UsertypeID)

        return jsonify({
            'UserID': user.UserID, 'Nickname': user.Nickname, 'Email': user.Email, 'PhoneNumber': user.PhoneNumber,
            'BirthDate': user.BirthDate, 'Usertype': usertype.Usertype
        }), HTTP_201_CREATED

    @auth_service.post('/login')
    def login():
        email = request.get_json().get('Email', '')
        password = request.get_json().get('Password', '')

        stmt = select(User).where(User.Email == email)

        with Session(engine) as session:
            user = session.execute(stmt).scalar()

            if user is None:
                return jsonify({
                    'error': 'User with passed email was not found in database'
                }), HTTP_400_BAD_REQUEST

            if check_password_hash(user.Password, password):
                usertype = session.get(Usertype, user.UsertypeID)
                identity = {'userid': user.UserID, 'usertype': usertype.Usertype}

                refresh = create_refresh_token(identity=identity)
                access = create_access_token(identity=identity)
            else:
                return jsonify({'error': 'Wrong credentials'}), HTTP_401_UNAUTHORIZED

        return jsonify({
            'user': {'refresh': refresh, 'access': access, 'UserID': user.UserID, 'Nickname': user.Nickname, 'Email': user.Email,
                     'PhoneNumber': user.PhoneNumber, 'BirthDate': user.BirthDate, 'Usertype': usertype.Usertype}
        }), HTTP_200_OK

    @auth_service.get("/me")
    @jwt_required()
    def me():
        user_identity = get_jwt_identity()
        stmt = select(User).where(User.UserID == user_identity.get('userid'))

        with Session(engine) as session:
            user = session.execute(stmt).scalar()

            if user is None:
                return jsonify({
                    'error': 'User with passed email was not found in database'
                }), HTTP_400_BAD_REQUEST

            usertype = session.get(Usertype, user.UsertypeID)

        return jsonify({
            'user': {'UserID': user.UserID, 'Nickname': user.Nickname, 'Email': user.Email, 'PhoneNumber': user.PhoneNumber,
                     'BirthDate': user.BirthDate, 'Usertype': usertype.Usertype}
        }), HTTP_200_OK

    @auth_service.get('/token-refresh')
    @jwt_required(refresh=True)
    def refresh_users_token():
        identity = get_jwt_identity()
        access = create_access_token(identity=identity)

        return jsonify({
            'access': access
        }), HTTP_200_OK

    return auth_service
