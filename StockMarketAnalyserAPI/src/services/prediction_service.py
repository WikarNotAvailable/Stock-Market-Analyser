from datetime import datetime
from flask import Blueprint, jsonify
import joblib
import numpy as np
from flask_jwt_extended import jwt_required
from keras.src.layers import Dropout
from matplotlib import pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from keras.src.saving.saving_api import save_model, load_model
from keras.layers import LSTM, Dense
from keras import optimizers, Sequential
import yfinance as yf
from src.constants.__http_status_codes import HTTP_200_OK


def create_model(tick):
    data = yf.download(tick, start='2002-10-01', end='2022-10-01')

    data['Simple return'] = (100 * (data['Close']).diff() / data['Close'].shift(1))
    data['Simple return 21std'] = data['Simple return'].rolling(21).std()
    data['Simple return 60std'] = data['Simple return'].rolling(60).std()
    data['Target'] = data['Simple return 21std'].shift(-1)

    data.dropna(inplace=True)

    training_data = data[data.index < '2020-03-01']  # 86,6%
    test_data = data[data.index >= '2020-03-01']  # 13,4%

    training_data.reset_index(inplace=True)
    test_data.reset_index(inplace=True)
    training_data.drop(['Date', 'Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume', 'Simple return'], axis=1,
                       inplace=True)
    test_data.drop(['Date', 'Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume', 'Simple return'], axis=1,
                   inplace=True)

    training_data_targets = training_data['Target']
    test_data_targets = test_data['Target']
    training_data.drop(['Target'], axis=1, inplace=True)
    test_data.drop(['Target'], axis=1, inplace=True)

    sc = MinMaxScaler(feature_range=(0, 1))
    training_data_scaled = sc.fit_transform(training_data)
    test_data_scaled = sc.transform(test_data)
    joblib.dump(sc, f'src/company_models/{tick}_scalerX_object.pkl')

    sc_targets = MinMaxScaler(feature_range=(0, 1))
    training_data_targets = np.reshape(training_data_targets, (len(training_data_targets), 1))
    test_data_targets = np.reshape(test_data_targets, (len(test_data_targets), 1))
    training_data_targets_scaled = sc_targets.fit_transform(training_data_targets)
    test_data_targets_scaled = sc_targets.transform(test_data_targets)
    joblib.dump(sc_targets, f'src/company_models/{tick}_scalerY_object.pkl')

    X_train = []
    X_test = []
    lookback_period = 60

    for column_number in range(2):
        X_train.append([])
        X_test.append([])
        for i in range(lookback_period, training_data_scaled.shape[0]):
            X_train[column_number].append(training_data_scaled[i - lookback_period:i, column_number])
        for i in range(lookback_period, test_data_scaled.shape[0]):
            X_test[column_number].append(test_data_scaled[i - lookback_period:i, column_number])

    X_train = np.moveaxis(X_train, [0], [2])
    X_test = np.moveaxis(X_test, [0], [2])

    X_train, y_train = np.array(X_train), np.array(training_data_targets_scaled[lookback_period:, 0])
    X_test, y_test = np.array(X_test), np.array(test_data_targets_scaled[lookback_period:, 0])

    y_train = np.reshape(y_train, (len(y_train), 1))
    y_test = np.reshape(y_test, (len(y_test), 1))

    model = Sequential()
    model.add(LSTM(100, input_shape=(lookback_period, 2)))
    model.add(Dense(32, activation='relu'))
    model.add(Dropout(0.1))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1, activation='linear'))
    adam = optimizers.Adam()
    model.compile(optimizer=adam, loss='mse', metrics=['mean_absolute_error'])
    model.fit(x=X_train, y=y_train, batch_size=32, epochs=50, shuffle=True, validation_split=0.1)
    save_model(model, f'src/company_models/{tick}.h5')

    y_pred = sc_targets.inverse_transform(model.predict(X_test))
    y_test = sc_targets.inverse_transform(y_test)
    plt.figure(figsize=(16, 8))
    plt.title(f'{tick} Simple Return Standard Deviation predictions test')
    plt.ylabel("Standard deviation (21days) of simple return", fontsize=18)
    plt.xlabel("Trading days (2020-03-01 - 2022-10-01) (without first lookback period)", fontsize=18)
    plt.plot(y_test, color='black', label='test')
    plt.plot(y_pred, color='green', label='predictions')
    plt.legend()
    plt.savefig(f'../AnalyserML/plots/{tick}_PLOT.png')


def construct_prediction_service(engine):
    prediction_service = Blueprint('prediction_service', __name__, url_prefix='/api/v1/predict')

    @prediction_service.get('/<string:tick>')
    @jwt_required()
    def get_stdev21_prediction(tick):
        data = yf.download(tick, start='2023-01-01', end=datetime.today().strftime('%Y-%m-%d'))

        data['Simple return'] = (100 * (data['Close']).diff() / data['Close'].shift(+1))
        data['Simple return 21std'] = data['Simple return'].rolling(21).std()
        data['Simple return 60std'] = data['Simple return'].rolling(60).std()

        data.dropna(inplace=True)
        data.reset_index(inplace=True)
        data.drop(['Date', 'Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume', 'Simple return'], axis=1,
                  inplace=True)

        data = data.tail(60)
        loaded_x_sc = joblib.load(f'src/company_models/{tick}_scalerX_object.pkl')
        data_scaled = loaded_x_sc.transform(data)

        X_predict = []

        for column_number in range(2):
            X_predict.append([])
            X_predict[column_number].append(data_scaled[:, column_number])

        model = load_model(f'src/company_models/{tick}.h5')
        loaded_y_sc = joblib.load(f'src/company_models/{tick}_scalerY_object.pkl')
        X_predict = np.moveaxis(X_predict, [0], [2])
        output = model.predict(np.array(X_predict))
        output = loaded_y_sc.inverse_transform(output)

        return jsonify({
            '21stdevPRED': round(output[0][0].item(), 2)
        }), HTTP_200_OK

    return prediction_service
