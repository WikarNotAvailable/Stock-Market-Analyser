from flask import Blueprint, request
from src.constants.__http_status_codes import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_200_OK
from src.models.usertype import Usertype
from sqlalchemy import insert, exc, select
from src.models.base import Base
from flask.json import jsonify
import validators


def construct_usertypes_controller(engine):
    usertypes_controller = Blueprint('usertypes_controller', __name__, url_prefix='/api/v1/usertypes')

    @usertypes_controller.post('/')
    def post_usertype():
        usertype_name = request.get_json().get('Usertype', '')

        stmt = (
            insert(Base.metadata.tables[Usertype.__tablename__]).values(Usertype=usertype_name)
        )
        with engine.connect() as conn:
            try:
                result = conn.execute(stmt)
            except exc.IntegrityError as error:
                if "UniqueViolation" in str(error):
                    return jsonify({
                        'error': 'Usertype has been already added to database'
                    }), HTTP_400_BAD_REQUEST
                else:
                    raise Exception(str(error))
            conn.commit()

        return jsonify({
            'Usertype': usertype_name
        }), HTTP_201_CREATED

    @usertypes_controller.get('/')
    def get_all_usertypes():
        stmt = (
            select(Base.metadata.tables[Usertype.__tablename__])
        )
        with engine.connect() as conn:
            result = conn.execute(stmt)

            return jsonify({
                'Usertypes': [row[0] for row in result.fetchall()]
            }), HTTP_200_OK

    return usertypes_controller




