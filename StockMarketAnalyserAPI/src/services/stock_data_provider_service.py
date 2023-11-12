from math import ceil
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from sqlalchemy.sql.functions import count
from src.constants.__http_status_codes import HTTP_400_BAD_REQUEST, HTTP_200_OK
from sqlalchemy import select
from sqlalchemy.orm import Session
from flask.json import jsonify
from datetime import date
from sqlalchemy import and_
from src.models.historical_stock_data import HistoricalStockData


def construct_stock_data_provider_service(engine):
    stock_data_provider_service = Blueprint('stock_data_provider_service', __name__, url_prefix='/api/v1/data-provider')

    @stock_data_provider_service.get('/stock-data/<int:company_id>')
    @jwt_required()
    def get_all_company_stock_data(company_id):
        start = request.args.get('start')
        page = request.args.get('page', type=int)
        per_page = request.args.get('per_page', type=int)

        if not start:
            return jsonify({'error': "You have to pass start date"}), HTTP_400_BAD_REQUEST

        try:
            date.fromisoformat(start)
        except ValueError:
            return jsonify({
                'error': 'Invalid date format'
            }), HTTP_400_BAD_REQUEST

        if start > date.today().strftime('%Y/%m/%d'):
            return jsonify({'error': "Date must be today or earlier"}), HTTP_400_BAD_REQUEST

        if page is not None and per_page is not None:
            is_paged = True
            stmt = select(HistoricalStockData) \
                .where(and_(start <= HistoricalStockData.Date, HistoricalStockData.CompanyID == company_id)) \
                .limit(per_page).offset((page - 1) * per_page)

            count_stmt = select(count(HistoricalStockData.DataID)) \
                .where(and_(start <= HistoricalStockData.Date, HistoricalStockData.CompanyID == company_id))
        else:
            is_paged = False
            stmt = select(HistoricalStockData) \
                .where(and_(start <= HistoricalStockData.Date, HistoricalStockData.CompanyID == company_id))

        with Session(engine) as session:
            all_stock_data = session.execute(stmt).scalars().all()

            data = []
            for one_stock_data in all_stock_data:
                data.append(
                    {'DataID': one_stock_data.DataID, 'Date': one_stock_data.Date, 'Close': one_stock_data.Close,
                     'Open': one_stock_data.Open, 'AdjClose': one_stock_data.AdjClose, 'Volume': one_stock_data.Volume,
                     'Low': one_stock_data.Low, 'High': one_stock_data.High})

        if is_paged:
            with Session(engine) as session:
                records_count = session.execute(count_stmt).scalar()

            number_of_pages = ceil(records_count / per_page)
            has_next = page < number_of_pages
            has_prev = number_of_pages + 1 >= page > 1
            return jsonify({
                'CompanyStockData': {'data': data, 'TotalRecords:': records_count, 'HasNextPage:': has_next,
                                     'HasPrevPage:': has_prev, 'NumberOfPages': number_of_pages, 'Page': page,
                                     'PageSize': per_page}
            }), HTTP_200_OK
        else:
            return jsonify({
                'CompanyStockData': {'data': data}
            }), HTTP_200_OK

    @stock_data_provider_service.get('/RSI/<int:company_id>')
    def get_company_rsi(company_id):
        stmt = select(HistoricalStockData.Close) \
            .where(HistoricalStockData.CompanyID == company_id).order_by(HistoricalStockData.Date.desc()).limit(14)

        with Session(engine) as session:
            all_stock_data = session.execute(stmt).all()

        avg_raise = 0.0
        avg_fall = 0.0
        for i in reversed(range(1, 14)):
            if all_stock_data[i][0] - all_stock_data[i - 1][0] >= 0:
                avg_raise += all_stock_data[i][0] - all_stock_data[i - 1][0]
            else:
                avg_fall -= all_stock_data[i][0] - all_stock_data[i - 1][0]

        rsi = 100 * avg_raise / (avg_raise + avg_fall)
        return jsonify({
            'RSI': rsi
        }), HTTP_200_OK

    @stock_data_provider_service.get('/SMA/<int:company_id>')
    def get_company_sma(company_id):
        stmt = select(HistoricalStockData.Close)\
            .where(HistoricalStockData.CompanyID == company_id).order_by(HistoricalStockData.Date.desc()).limit(200)

        with Session(engine) as session:
            all_stock_data = session.execute(stmt).all()

        sma_20_sum = 0.0
        sma_50_sum = 0.0
        sma_200_sum = 0.0

        for i in range(200):
            if i > 49:
                sma_200_sum += all_stock_data[i][0]
            elif i > 19:
                sma_50_sum += all_stock_data[i][0]
                sma_200_sum += all_stock_data[i][0]
            else:
                sma_20_sum += all_stock_data[i][0]
                sma_50_sum += all_stock_data[i][0]
                sma_200_sum += all_stock_data[i][0]

        return jsonify({
            'SMA20': sma_20_sum / 20, 'SMA50': sma_50_sum / 50, 'SMA200': sma_200_sum / 200
        }), HTTP_200_OK

    @stock_data_provider_service.get('/EMA/<int:company_id>')
    def get_company_ema(company_id):
        start = request.args.get('start')

        if not start:
            return jsonify({'error': "You have to pass start date"}), HTTP_400_BAD_REQUEST

        try:
            date.fromisoformat(start)
        except ValueError:
            return jsonify({
                'error': 'Invalid date format'
            }), HTTP_400_BAD_REQUEST

        stmt = select(HistoricalStockData.Close, HistoricalStockData.Date) \
            .where(HistoricalStockData.CompanyID == company_id).order_by(HistoricalStockData.Date.asc())

        total_count_stmt = select(count(HistoricalStockData.DataID)).where(HistoricalStockData.CompanyID == company_id)

        count_stmt = select(count(HistoricalStockData.DataID)) \
            .where(and_(start <= HistoricalStockData.Date, HistoricalStockData.CompanyID == company_id))

        with Session(engine) as session:
            all_stock_data = session.execute(stmt).all()
            total_records_count = session.execute(total_count_stmt).scalar()
            records_count = session.execute(count_stmt).scalar()

        smoothing_factor200 = 2 / (1 + 200)
        smoothing_factor50 = 2 / (1 + 50)
        smoothing_factor26 = 2 / (1 + 26)
        smoothing_factor12 = 2 / (1 + 12)

        ema_12_first = 0.0
        ema_26_first = 0.0
        ema_50_first = 0.0
        ema_200_first = 0.0

        for i in range(200):
            if i <= 149:
                ema_200_first += all_stock_data[i][0]
            elif i <= 173:
                ema_50_first += all_stock_data[i][0]
                ema_200_first += all_stock_data[i][0]
            elif i <= 187:
                ema_26_first += all_stock_data[i][0]
                ema_50_first += all_stock_data[i][0]
                ema_200_first += all_stock_data[i][0]
            else:
                ema_12_first += all_stock_data[i][0]
                ema_26_first += all_stock_data[i][0]
                ema_50_first += all_stock_data[i][0]
                ema_200_first += all_stock_data[i][0]

        ema_12_first = ema_12_first / 12
        ema_26_first = ema_26_first / 26
        ema_50_first = ema_50_first / 50
        ema_200_first = ema_200_first / 200

        ema_12 = [{'ema12val': ema_12_first, 'Date': all_stock_data[11][1]}]
        ema_26 = [{'ema26val': ema_26_first, 'Date': all_stock_data[25][1]}]
        ema_50 = [{'ema50val': ema_50_first, 'Date': all_stock_data[149][1]}]
        ema_200 = [{'ema200val': ema_200_first, 'Date': all_stock_data[199][1]}]

        for i in range(12, total_records_count):
            if i > 199:
                ema_12.append({'ema12val': (all_stock_data[i][0] - ema_12[len(ema_12) - 1]['ema12val'])
                                           * smoothing_factor12 + ema_12[len(ema_12) - 1]['ema12val'],
                               'Date': all_stock_data[i][1]})

                ema_26.append({'ema26val': (all_stock_data[i][0] - ema_26[len(ema_26) - 1]['ema26val'])
                                           * smoothing_factor26 + ema_26[len(ema_26) - 1]['ema26val'],
                               'Date': all_stock_data[i][1]})

                ema_50.append({'ema50val': (all_stock_data[i][0] - ema_50[len(ema_50) - 1]['ema50val'])
                                           * smoothing_factor50 + ema_50[len(ema_50) - 1]['ema50val'],
                               'Date': all_stock_data[i][1]})

                ema_200.append({'ema200val': (all_stock_data[i][0] - ema_200[len(ema_200) - 1]['ema200val'])
                                             * smoothing_factor200 + ema_200[len(ema_200) - 1]['ema200val'],
                                'Date': all_stock_data[i][1]})
            elif i > 49:
                ema_12.append({'ema12val': (all_stock_data[i][0] - ema_12[len(ema_12) - 1]['ema12val'])
                                           * smoothing_factor12 + ema_12[len(ema_12) - 1]['ema12val'],
                               'Date': all_stock_data[i][1]})

                ema_26.append({'ema26val': (all_stock_data[i][0] - ema_26[len(ema_26) - 1]['ema26val'])
                                           * smoothing_factor26 + ema_26[len(ema_26) - 1]['ema26val'],
                               'Date': all_stock_data[i][1]})

                ema_50.append({'ema50val': (all_stock_data[i][0] - ema_50[len(ema_50) - 1]['ema50val'])
                                           * smoothing_factor50 + ema_50[len(ema_50) - 1]['ema50val'],
                               'Date': all_stock_data[i][1]})
            elif i > 25:
                ema_12.append({'ema12val': (all_stock_data[i][0] - ema_12[len(ema_12) - 1]['ema12val'])
                                           * smoothing_factor12 + ema_12[len(ema_12) - 1]['ema12val'],
                               'Date': all_stock_data[i][1]})

                ema_26.append({'ema26val': (all_stock_data[i][0] - ema_26[len(ema_26) - 1]['ema26val'])
                                           * smoothing_factor26 + ema_26[len(ema_26) - 1]['ema26val'],
                               'Date': all_stock_data[i][1]})
            else:
                ema_12.append({'ema12val': (all_stock_data[i][0] - ema_12[len(ema_12) - 1]['ema12val'])
                                           * smoothing_factor12 + ema_12[len(ema_12) - 1]['ema12val'],
                               'Date': all_stock_data[i][1]})

        ema_12_start_index = len(ema_12) - records_count if len(ema_12) - records_count >= 0 else 0
        ema_26_start_index = len(ema_26) - records_count if len(ema_26) - records_count >= 0 else 0
        ema_50_start_index = len(ema_50) - records_count if len(ema_50) - records_count >= 0 else 0
        ema_200_start_index = len(ema_200) - records_count if len(ema_200) - records_count >= 0 else 0

        return jsonify({
            'EMA12': ema_12[ema_12_start_index:len(ema_12)],
            'EMA26': ema_26[ema_26_start_index:len(ema_26)],
            'EMA50': ema_50[ema_50_start_index:len(ema_50)],
            'EMA200': ema_200[ema_200_start_index:len(ema_200)]
        }), HTTP_200_OK

    @stock_data_provider_service.get('/stochastic-oscillator/<int:company_id>')
    def get_company_stochastic_oscillator(company_id):
        start = request.args.get('start')

        if not start:
            return jsonify({'error': "You have to pass start date"}), HTTP_400_BAD_REQUEST

        try:
            date.fromisoformat(start)
        except ValueError:
            return jsonify({
                'error': 'Invalid date format'
            }), HTTP_400_BAD_REQUEST

        stmt = select(HistoricalStockData.Close, HistoricalStockData.Date)\
            .where(HistoricalStockData.CompanyID == company_id).order_by(HistoricalStockData.Date.asc())

        total_count_stmt = select(count(HistoricalStockData.DataID))\
            .where(HistoricalStockData.CompanyID == company_id)

        count_stmt = select(count(HistoricalStockData.DataID))\
            .where(and_(start <= HistoricalStockData.Date, HistoricalStockData.CompanyID == company_id))

        with Session(engine) as session:
            all_stock_data = session.execute(stmt).all()
            total_records_count = session.execute(total_count_stmt).scalar()
            records_count = session.execute(count_stmt).scalar()

        stock_data_14 = []
        for one_stock_data in all_stock_data[0:14]:
            stock_data_14.append(one_stock_data[0])

        max_stock_data = max(stock_data_14)
        min_stock_data = min(stock_data_14)

        k_fast_first = (stock_data_14[13] - min_stock_data) / (max_stock_data - min_stock_data) * 100

        k_fast_arr = [{'kfast': k_fast_first, 'Date': all_stock_data[13][1]}]
        for i in range(14, total_records_count):
            del stock_data_14[0]
            stock_data_14.append(all_stock_data[i][0])
            max_stock_data = max(stock_data_14)
            min_stock_data = min(stock_data_14)
            k_fast = (stock_data_14[13] - min_stock_data) / (max_stock_data - min_stock_data) * 100
            k_fast_arr.append({'kfast': k_fast, 'Date': all_stock_data[i][1]})

        d_fast_arr = []
        for i in range(2, len(k_fast_arr)):
            d_fast = (k_fast_arr[i]['kfast'] + k_fast_arr[i - 1]['kfast'] + k_fast_arr[i - 2]['kfast']) / 3
            d_fast_arr.append({'dfast': d_fast, 'Date': k_fast_arr[i]['Date']})

        d_slow_arr = []
        for i in range(2, len(d_fast_arr)):
            d_slow = (d_fast_arr[i]['dfast'] + d_fast_arr[i - 1]['dfast'] + d_fast_arr[i - 2]['dfast']) / 3
            d_slow_arr.append({'dslow': d_slow, 'Date': d_fast_arr[i]['Date']})

        kfast_start_index = len(k_fast_arr) - records_count if len(k_fast_arr) - records_count >= 0 else 0
        dfast_start_index = len(d_fast_arr) - records_count if len(d_fast_arr) - records_count >= 0 else 0
        dslow_start_index = len(d_slow_arr) - records_count if len(d_slow_arr) - records_count >= 0 else 0

        return jsonify({
            'kfast': k_fast_arr[kfast_start_index:len(k_fast_arr)],
            'dfast/kslow': d_fast_arr[dfast_start_index:len(d_fast_arr)],
            'dslow': d_slow_arr[dslow_start_index:len(d_slow_arr)]
        }), HTTP_200_OK

    @stock_data_provider_service.get('/on-balance-volume/<int:company_id>')
    def get_company_on_balance_volume(company_id):
        start = request.args.get('start')

        if not start:
            return jsonify({'error': "You have to pass start date"}), HTTP_400_BAD_REQUEST

        try:
            date.fromisoformat(start)
        except ValueError:
            return jsonify({
                'error': 'Invalid date format'
            }), HTTP_400_BAD_REQUEST

        stmt = select(HistoricalStockData.Close, HistoricalStockData.Volume, HistoricalStockData.Date) \
            .where(and_(start <= HistoricalStockData.Date, HistoricalStockData.CompanyID == company_id))\
            .order_by(HistoricalStockData.Date.asc())

        count_stmt = select(count(HistoricalStockData.DataID))\
            .where(and_(start <= HistoricalStockData.Date, HistoricalStockData.CompanyID == company_id))

        with Session(engine) as session:
            all_stock_data = session.execute(stmt).all()
            records_count = session.execute(count_stmt).scalar()

        on_balance_volumes = [{'OnBalanceVolume': all_stock_data[0][1], 'Date': all_stock_data[0][2]}]

        for i in range(1, records_count):
            if all_stock_data[i][0] > all_stock_data[i-1][0]:
                on_balance_volumes.append({'OnBalanceVolume': on_balance_volumes[i-1]['OnBalanceVolume']
                                                              + all_stock_data[i][1], 'Date': all_stock_data[i][2]})
            elif all_stock_data[i][0] == all_stock_data[i-1][0]:
                on_balance_volumes.append({'OnBalanceVolume': on_balance_volumes[i-1]['OnBalanceVolume'],
                                           'Date': all_stock_data[i][2]})
            else:
                on_balance_volumes.append({'OnBalanceVolume': on_balance_volumes[i-1]['OnBalanceVolume']
                                                              - all_stock_data[i][1], 'Date': all_stock_data[i][2]})

        return jsonify({
            'OnBalanceVolumes': on_balance_volumes
        }), HTTP_200_OK

    return stock_data_provider_service
