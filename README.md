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

**Objective:** answer, at a glance, which crops and markets are actually
making money, and where sourcing and export effort should focus next.

---

## What Was Done

**1. Data → Excel (star schema)**
Structured the business data into a proper star schema in Excel: one fact
table (`Fact_Shipments`) plus five dimension tables (`Dim_Crop`,
`Dim_Country`, `Dim_Broker`, `Dim_Quality`, `Dim_Date`).

**2. Python + PostgreSQL**
Loaded all six sheets into a PostgreSQL database using Python
(`python/load_to_postgres.py`), so the data lives in a queryable database
rather than only a spreadsheet.

**3. SQL analysis**
Wrote four analysis queries (`sql/`) answering the core business questions:
- Profit and margin by crop
- Profit and margin by destination country
- Crop x country cross-tab (where a crop performs differently by market)
- Broker performance ranking using a window function

**4. Power BI dashboard**
Built a 7-page Power BI report on the same star schema, with relationships
modeled explicitly in Power BI's Model view — covering monthly trends, crop
profitability, country profitability, quality grade impact, farmer sourcing
regions, the crop x country cross-tab, and full broker performance.

**5. Interactive web dashboard**
Built a self-contained, filterable HTML/Chart.js dashboard directly from the
Excel data, deployed live via Vercel. It includes KPI cards, monthly
cost/revenue/profit trends, profit breakdowns by crop/country/quality grade,
a farmer sourcing region view, a crop x country profit heatmap, a full
sortable broker table, live crop/country filters, and auto-generated
data-driven insights.

---

## Key Findings

- Chilli Powder and Chilli (Dried Red) are the strongest performers
  (~26% and ~25% margin), while onions run at a structural loss
  (Red: -24%, White: -30%) across the whole period.
- USA and UK are the largest and most profitable markets; UAE has the
  highest volume but the thinnest margin.
- Grade A shipments convert at ~26% margin, nearly double Grade B — quality
  mix is a real, controllable lever, not just crop or destination.
- The same crop performs very differently by market, so decisions need to be
  made at the crop-country level, not just crop-level or country-level alone.

---

## Tech Stack

Excel · Python (pandas) · PostgreSQL · SQL (window functions, joins,
aggregation) · Power BI · Chart.js · HTML/CSS/JS · Vercel

## Folder Structure

```
lpgd-export-analytics/
├── data/raw/LPGD_Business_Data.xlsx
├── sql/                  # analysis queries
├── python/               # load + dashboard build scripts
├── powerbi/              # .pbix file + page screenshots
├── dashboard/            # interactive dashboard + screenshots
├── docs/
└── README.md
