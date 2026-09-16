"""
LPGD Export Analytics — Load cleaned Excel data into PostgreSQL.

Run this after cleaning: it reads the star-schema sheets from
LPGD_Business_Data.xlsx and loads each one as a table in PostgreSQL,
exactly like the load step in the Bank Loan Risk project.
"""

import pandas as pd
from sqlalchemy import create_engine
from urllib.parse import quote_plus

# --- update with your own credentials ---
DB_USER = "postgres"
DB_PASSWORD = "YOUR_PASSWORD"  # plain password; quote_plus escapes special characters like @
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "lpgd_db"

encoded_password = quote_plus(DB_PASSWORD)
engine = create_engine(f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

EXCEL_PATH = "../data/raw/LPGD_Business_Data.xlsx"

sheets = {
    "fact_shipments": "Fact_Shipments",
    "dim_crop": "Dim_Crop",
    "dim_country": "Dim_Country",
    "dim_broker": "Dim_Broker",
    "dim_quality": "Dim_Quality",
    "dim_date": "Dim_Date",
}

for table_name, sheet_name in sheets.items():
    df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
    df.to_sql(table_name, engine, if_exists="replace", index=False)
    print(f"Loaded {len(df)} rows into '{table_name}' from sheet '{sheet_name}'.")

print("\nAll tables loaded into PostgreSQL database:", DB_NAME)
