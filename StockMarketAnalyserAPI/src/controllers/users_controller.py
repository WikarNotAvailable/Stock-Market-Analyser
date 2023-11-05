from flask import Blueprint, request
from src.constants.__http_status_codes import HTTP_400_BAD_REQUEST, HTTP_200_OK, HTTP_404_NOT_FOUND, \
    HTTP_401_UNAUTHORIZED
from src.models.user import User
from src.models.usertype import Usertype
from sqlalchemy import exc, select, delete, update
from sqlalchemy.orm import Session
from flask.json import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import phonenumbers
import validators
import datetime


def construct_users_controller(engine):
    users_controller = Blueprint('users_controller', __name__, url_prefix='/api/v1/users')

    @users_controller.get('/')
    @jwt_required()
    def get_all_users():
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        stmt = select(User)

        with Session(engine) as session:
            users = session.execute(stmt).scalars().all()

            data = []
            for user in users:
                usertype = session.get(Usertype, user.UsertypeID)
                data.append({'Nickname': user.Nickname, 'Email': user.Email, 'PhoneNumber': user.PhoneNumber,
                             'BirthDate': user.BirthDate, 'Usertype': usertype.Usertype})

            return jsonify({
                'users': {'data': data}
            }), HTTP_200_OK

    @users_controller.get('/<int:id>')
    @jwt_required()
    def get_user(id):
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        stmt = select(User).where(User.UserID == id)

        with Session(engine) as session:
            user = session.execute(stmt).scalar()
            if user is None:
                return jsonify({
                    'error': 'User with passed id was not found in database'
                }), HTTP_404_NOT_FOUND
            usertype = session.get(Usertype, user.UsertypeID)

        return jsonify({
             'Nickname': user.Nickname, 'Email': user.Email, 'PhoneNumber': user.PhoneNumber,
             'BirthDate': user.BirthDate, 'Usertype': usertype.Usertype
        }), HTTP_200_OK

    @users_controller.delete('/<int:id>')
    @jwt_required()
    def delete_user(id):
        user_identity = get_jwt_identity()
        if user_identity.get('userid') != id and user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        stmt = select(User).where(User.UserID == id)

        with Session(engine) as session:
            user = session.execute(stmt).scalar()
            if user is None:
                return jsonify({
                    'error': 'User with passed id was not found in database'
                }), HTTP_404_NOT_FOUND

        stmt = delete(User).where(User.UserID == id)

        with Session(engine) as session:
            session.execute(stmt)
            session.commit()

        return jsonify({
            'response': "deleted"
        }), HTTP_200_OK

    @users_controller.put('/<int:id>')
    @jwt_required()
    def update_user(id):
        user_identity = get_jwt_identity()
        if user_identity.get('userid') != id and user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        stmt = select(User).where(User.UserID == id)

        with Session(engine) as session:
            user = session.execute(stmt).scalar()
            if user is None:
                return jsonify({
                    'error': 'User with passed id was not found in database'
                }), HTTP_404_NOT_FOUND

        nickname = request.get_json().get('Nickname', '')
        email = request.get_json().get('Email', '')
        phone_number = request.get_json().get('PhoneNumber', '')
        birth_date = request.get_json().get('BirthDate', '')
        password = request.get_json().get('Password', '')
        usertype_id = request.get_json().get('UsertypeID')

        nickname = user.Nickname if not nickname else nickname
        email = user.Email if not email else email
        phone_number = user.PhoneNumber if not phone_number else phone_number
        usertype_id = user.UsertypeID if not usertype_id else usertype_id

        if not birth_date:
            birth_date = user.BirthDate
        else:
            try:
                datetime.date.fromisoformat(birth_date)
            except ValueError:
                return jsonify({
                    'error': 'Invalid date'
                }), HTTP_400_BAD_REQUEST

        if not password:
            password = user.Password
        else:
            if len(password) < 3:
                return jsonify({'error': "Password is too short"}), HTTP_400_BAD_REQUEST
            password = generate_password_hash(password)

        if len(nickname) < 3:
            return jsonify({'error': "Nickname is too short"}), HTTP_400_BAD_REQUEST
        elif len(nickname) > 30:
            return jsonify({'error': "Nickname is too long"}), HTTP_400_BAD_REQUEST

        if not validators.email(email):
            return jsonify({'error': "Email is not valid"}), HTTP_400_BAD_REQUEST

        if phonenumbers.is_possible_number(phonenumbers.parse(phone_number)) is False:
            return jsonify({'error': "Phone number is not valid"}), HTTP_400_BAD_REQUEST

        stmt = update(User).where(User.UserID == id).values(Nickname=nickname, Email=email, PhoneNumber=phone_number,
                                                            BirthDate=birth_date, Password=password,
                                                            UsertypeID=usertype_id)

        with Session(engine) as session:
            try:
                session.execute(stmt)
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
                elif 'ForeignKeyViolation' in str(error):
                    return jsonify({
                        'error': 'Usertype does not exist in database'
                    }), HTTP_400_BAD_REQUEST
                else:
                    raise Exception(str(error))

        usertype = session.get(Usertype, usertype_id)

        return jsonify({
            'Nickname': nickname, 'Email': email, 'PhoneNumber': phone_number, 'BirthDate': birth_date,
            'Usertype': usertype.Usertype
        }), HTTP_200_OK

    return users_controller
