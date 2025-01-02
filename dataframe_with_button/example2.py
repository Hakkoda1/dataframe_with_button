import streamlit as st
import pandas as pd
from dataframe_with_button import custom_dataframe

df = pd.DataFrame({
    "BATCH_ID": ["item1", "item2", "item3"],
    "Name": ["Apple", "Banana", "Cherry"],
    "Price": [1.2, 0.8, 2.5],
})

# Invoke custom component
result = custom_dataframe(df, clickable_column="BATCH_ID")
st.write(f'Button {result} was clicked')