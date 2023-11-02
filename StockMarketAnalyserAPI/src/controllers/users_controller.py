from flask import Blueprint, request
from src.constants.__http_status_codes import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_200_OK
from src.models.user import User
from src.models.usertype import Usertype
from sqlalchemy import delete, exc, select, update
from sqlalchemy.orm import Session
from flask.json import jsonify
import phonenumbers
import validators
import datetime


def construct_users_controller(engine):
    users_controller = Blueprint('users_controller', __name__, url_prefix='/api/v1/users')

    @users_controller.post('/register')
    def register():
        nickname = request.get_json().get('Nickname', '')
        email = request.get_json().get('Email', '')
        phone_number = request.get_json().get('PhoneNumber', '')
        birth_date = request.get_json().get('BirthDate', '')
        password = request.get_json().get('Password', '')
        usertype_id = request.get_json().get('UsertypeID')

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

        user = User(Nickname=nickname, Email=email, PhoneNumber=phone_number, BirthDate=birth_date, Password=password,
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
            'BirthDate': user.BirthDate, 'Password': user.Password, 'Usertype': usertype.Usertype
        }), HTTP_201_CREATED

    return users_controller
