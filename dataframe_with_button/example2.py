import streamlit as st
import pandas as pd

import json

# from dataframe_with_button import editable_dataframe, static_dataframe
from __init__ import editable_dataframe, static_dataframe
df = pd.DataFrame({
    "BATCH_ID": ["item1", "item2", "item3"],
    "Name": ["AppleApple", "Banana", "Cherry"],
    "Price": [1.2, 0.8, 2.5],
    "IN_STOCK": [True, False, True],
    "EMAIL": ["abc@gmail.com", "cde@k.com", "abc@gmail.com"]
})

df["EMAIL"] = pd.Categorical(df["EMAIL"], categories=["abc@gmail.com", "cde@k.com"])
result = static_dataframe(df, clickable_column="Name")
result2 = editable_dataframe(df, clickable_column="Name")

st.dataframe(df)
st.json(result2)