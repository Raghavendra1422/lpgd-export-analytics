"""
Reads LPGD_Business_Data.xlsx (the star-schema workbook) and produces
the RECORDS json array the dashboard/index.html file needs, then
injects it into the HTML in place of the `const RECORDS = [];` line.
"""

import pandas as pd
import json

EXCEL_PATH = "../data/raw/LPGD_Business_Data.xlsx"
DASHBOARD_PATH = "../dashboard/index.html"

fact = pd.read_excel(EXCEL_PATH, sheet_name="Fact_Shipments")
dim_crop = pd.read_excel(EXCEL_PATH, sheet_name="Dim_Crop")
dim_country = pd.read_excel(EXCEL_PATH, sheet_name="Dim_Country")
dim_broker = pd.read_excel(EXCEL_PATH, sheet_name="Dim_Broker")

df = fact.merge(dim_crop, on="crop_id")
df = df.merge(dim_country, on="country_id")
df = df.merge(dim_broker[["broker_id", "broker_name"]], on="broker_id")

df["month"] = pd.to_datetime(df["shipment_date"]).dt.strftime("%Y-%m")

records = df.apply(lambda r: {
    "month": r["month"],
    "crop": r["crop"],
    "country": r["country"],
    "broker": r["broker_name"],
    "region": r["farmer_region"],
    "grade": r["quality_grade"],
    "qty": int(r["quantity_kg"]),
    "cost": round(float(r["shipment_cost"]), 2),
    "rev": round(float(r["total_revenue"]), 2),
    "profit": round(float(r["profit_or_loss"]), 2),
}, axis=1).tolist()

records_json = json.dumps(records)
print(f"Built {len(records)} records.")

with open(DASHBOARD_PATH, "r", encoding="utf-8") as f:
    html = f.read()

html = html.replace("const RECORDS = [];", f"const RECORDS = {records_json};")

# Also append the full rendering script (charts, filters, tables, insights)
# if it isn't already present.
if "function render(){" not in html:
    render_script = open("dashboard_render_script.js", "r", encoding="utf-8").read()
    html = html.replace("</script>\n</body>", render_script + "\n</script>\n</body>")

with open(DASHBOARD_PATH, "w", encoding="utf-8") as f:
    f.write(html)

print("Dashboard data injected into", DASHBOARD_PATH)
