# LPGD Export Profitability Analytics

End-to-end data analytics project for **LPGD Pvt Ltd**, an agri import-export
business based in Nizamabad, Telangana, exporting turmeric, chilli, chilli
powder, onions, soya, and cotton to buyers in the UAE, USA, UK, Germany, and
Australia.

**Live dashboard:** _add your Vercel URL here after deployment_
**Author:** Raghavendra ([GitHub](https://github.com/Raghavendra1422))

> Note: this project uses realistic **synthetic data** (Feb 2024 – Aug 2026,
> 1,635 shipments) modeled on real 2024–2026 market price ranges for these
> commodities, built for portfolio/learning purposes. It is not LPGD's actual
> financial data.

---

## Business Problem

As founder, decisions about which crops to buy, which markets to prioritize,
and which brokers to work with were being made without a consolidated view of
profitability. This project builds that view.

## Business Objective

Answer, at a glance: **which crops and markets are actually making money, and
where should sourcing and export effort focus next?**

---

## Workflow

**1. Data → Excel (star schema)**
Raw business data was structured into a proper star schema in Excel:
one fact table (`Fact_Shipments`) plus five dimension tables (`Dim_Crop`,
`Dim_Country`, `Dim_Broker`, `Dim_Quality`, `Dim_Date`). See
[`data/raw/LPGD_Business_Data.xlsx`](data/raw/LPGD_Business_Data.xlsx).

**2. Python + PostgreSQL**
[`python/load_to_postgres.py`](python/load_to_postgres.py) loads all six
sheets into a PostgreSQL database, mirroring a real analytics stack where
data lives in a queryable database, not just a spreadsheet.

**3. SQL analysis**
Four analysis queries in [`sql/`](sql/) answer the core business questions:
- `01_profit_by_crop.sql` — which products are worth buying more of
- `02_profit_by_country.sql` — which export market is most valuable
- `03_crop_country_crosstab.sql` — where a crop performs differently by market
- `04_broker_performance.sql` — which of the 25 brokers are most profitable
  (uses a window function to rank brokers)

**4. Power BI dashboard**
A Power BI report (screenshots in [`powerbi/`](powerbi/)) built on the same
star schema, with relationships modeled explicitly in Power BI's Model view.

**5. Interactive web dashboard**
[`dashboard/index.html`](dashboard/index.html) — a self-contained,
filterable HTML/Chart.js dashboard built directly from the Excel data
(see [`python/build_dashboard_data.py`](python/build_dashboard_data.py)),
deployed live via Vercel. Includes:
- KPI cards (revenue, cost, profit, margin %, loss-making shipment count)
- Monthly cost/revenue/profit trend
- Profit % by crop, country, and quality grade (with profit-share pie charts)
- Farmer sourcing region breakdown
- Crop × country profit heatmap cross-tab
- Full sortable broker performance table (all 25 brokers)
- Crop/country filters affecting every chart
- Auto-generated, data-driven insights

---

## Key Findings

- **Chilli Powder and Chilli (Dried Red)** are the strongest performers
  (~26% and ~25% margin), while **onions run at a structural loss**
  (Red: -24%, White: -30%) across the whole period.
- **USA and UK** are the largest and most profitable markets; **UAE** has
  the highest volume but the thinnest margin.
- **Grade A shipments convert at ~26% margin, nearly double Grade B** —
  quality mix is a real, controllable lever, not just crop or destination.
- The same crop performs very differently by market — see the crop × country
  cross-tab in the dashboard for specific combinations worth leaning into
  or avoiding.

---

## Tech Stack

Excel · Python (pandas) · PostgreSQL · SQL (window functions, joins,
aggregation) · Power BI · Chart.js · HTML/CSS/JS · Vercel

## Folder Structure

```
lpgd-export-analytics/
├── data/
│   ├── raw/LPGD_Business_Data.xlsx      # star-schema source data
│   └── processed/                       # (reserved for cleaned exports)
├── sql/                                 # analysis queries
├── python/                              # load + dashboard build scripts
├── powerbi/                             # Power BI report + screenshots
├── dashboard/index.html                 # deployed interactive dashboard
├── docs/                                # additional notes
└── README.md
```

## Running Locally

```bash
# 1. Load data into PostgreSQL
cd python
pip install pandas sqlalchemy psycopg2-binary openpyxl
python load_to_postgres.py

# 2. Run the SQL queries in sql/ against your database

# 3. Rebuild the dashboard from the Excel file (if data changes)
python build_dashboard_data.py

# 4. Open dashboard/index.html directly in a browser, or deploy to Vercel
```
