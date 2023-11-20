import joblib
import numpy as np
from keras.src.saving.saving_api import load_model
from datetime import datetime
import yfinance as yf

data = yf.download('AAPL', start='2023-01-01', end=datetime.today().strftime('%Y-%m-%d'))

data['Simple return'] = (100 * (data['Close']).diff() / data['Close'].shift(+1))
data['Simple return 21std'] = data['Simple return'].rolling(21).std()
data['Simple return 60std'] = data['Simple return'].rolling(60).std()

data.dropna(inplace=True)
data.reset_index(inplace=True)
data.drop(['Date', 'Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume', 'Simple return'], axis=1, inplace=True)

data = data.tail(60)
loaded_x_sc = joblib.load('AAPL_scalerX_object.pkl')
data_scaled = loaded_x_sc.transform(data)

X_predict = []
lookback_period = 60

for column_number in range(2):
    X_predict.append([])
    X_predict[column_number].append(data_scaled[:, column_number])

model = load_model('AAPL.h5')
loaded_y_sc = joblib.load('AAPL_scalerY_object.pkl')
X_predict = np.moveaxis(X_predict, [0], [2])
output = model.predict(np.array(X_predict))
output = loaded_y_sc.inverse_transform(output)

print(output)
