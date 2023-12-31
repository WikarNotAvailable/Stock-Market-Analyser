from flask import Blueprint, request
from src.constants.__http_status_codes import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_200_OK, HTTP_404_NOT_FOUND, \
    HTTP_401_UNAUTHORIZED
from src.models.usertype import Usertype
from sqlalchemy import delete, exc, select, update
from sqlalchemy.orm import Session
from flask.json import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity


def construct_usertypes_controller(engine):
    usertypes_controller = Blueprint('usertypes_controller', __name__, url_prefix='/api/v1/usertypes')

    @usertypes_controller.post('/')
    @jwt_required()
    def post_usertype():
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        usertype_name = request.get_json().get('Usertype', '')

        usertype = Usertype(Usertype=usertype_name)

        with Session(engine) as session:
            with session.begin():
                try:
                    session.add(usertype)
                    session.commit()
                except exc.IntegrityError as error:
                    session.rollback()
                    if "UniqueViolation" in str(error):
                        return jsonify({
                            'error': 'Usertype already exists in database'
                        }), HTTP_400_BAD_REQUEST
                    else:
                        raise Exception(str(error))
            session.refresh(usertype)

        return jsonify({
            'UsertypeID': usertype.UsertypeID, 'Usertype': usertype.Usertype
        }), HTTP_201_CREATED

    @usertypes_controller.get('/')
    def get_all_usertypes():
        stmt = select(Usertype)

        with Session(engine) as session:
            usertypes = session.execute(stmt).scalars().all()

            data = []
            for usertype in usertypes:
                data.append({'UsertypeID': usertype.UsertypeID, 'Usertype': usertype.Usertype})

        return jsonify({
            'usertypes': {'data': data}
        }), HTTP_200_OK

    @usertypes_controller.get('/<int:id>')
    def get_usertype(id):
        stmt = select(Usertype).where(Usertype.UsertypeID == id)

        with Session(engine) as session:
            usertype = session.execute(stmt).scalar()
            if usertype is None:
                return jsonify({
                     'error': 'Usertype with passed id was not found in database'
                }), HTTP_404_NOT_FOUND

        return jsonify({
            'UsertypeID': usertype.UsertypeID, 'Usertype': usertype.Usertype
        }), HTTP_200_OK

    @usertypes_controller.delete('/<int:id>')
    @jwt_required()
    def delete_usertype(id):
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        item = get_usertype(id)
        if item[1] is HTTP_404_NOT_FOUND:
            return item

        stmt = delete(Usertype).where(Usertype.UsertypeID == id)

        with Session(engine) as session:
            session.execute(stmt)
            session.commit()

        return jsonify({
            'response': "deleted"
        }), HTTP_200_OK

    @usertypes_controller.put('/<int:id>')
    @jwt_required()
    def update_usertype(id):
        user_identity = get_jwt_identity()
        if user_identity.get('usertype') != 'Admin':
            return jsonify({'error': "Unauthorized action"}), HTTP_401_UNAUTHORIZED

        item = get_usertype(id)
        if item[1] is HTTP_404_NOT_FOUND:
            return item

        usertype_name = request.get_json().get('Usertype', '')

        stmt = update(Usertype).where(Usertype.UsertypeID == id).values(Usertype=usertype_name)

        with Session(engine) as session:
            try:
                session.execute(stmt)
                session.commit()
            except exc.IntegrityError as error:
                session.rollback()
                if "UniqueViolation" in str(error):
                    return jsonify({
                        'error': 'Usertype already exists in database'
                    }), HTTP_400_BAD_REQUEST
                else:
                    raise Exception(str(error))

        return jsonify({
            'UsertypeID': id, 'Usertype': usertype_name
        }), HTTP_200_OK

    return usertypes_controller






