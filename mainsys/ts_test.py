import pandas as pd
import numpy as np
import statsmodels.tsa.stattools as st

def read_ts(tsArray):
    data = []
    index = []
    for tsobj in tsArray:
        data.append(np.log(tsobj[0]))
        index.append(tsobj[1])

    return data, index

# def

def convert_ts(data, index):
    return pd.Series(data, index)

def choose_model(ts, maxar, maxma):
    order = st.arma_order_select_ic(ts, maxar, maxma, ic=['aic', 'bic', 'hqic'])
    return order.bic_min_order