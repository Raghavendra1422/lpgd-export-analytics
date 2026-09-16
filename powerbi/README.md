# Power BI Report

Place your `.pbix` file here (e.g. `LPGD_Dashboard.pbix`) along with 2-3
screenshots of the report pages (e.g. `overview.png`, `crop-analysis.png`).

Note: `.pbix` files can be large — if GitHub warns about file size, use
[Git LFS](https://git-lfs.github.com/) or simply keep the screenshots in the
repo and host the `.pbix` file separately (e.g. Google Drive) linked from
the main README.

## Relationships used (star schema)
- `Fact_Shipments.crop_id` → `Dim_Crop.crop_id`
- `Fact_Shipments.country_id` → `Dim_Country.country_id`
- `Fact_Shipments.broker_id` → `Dim_Broker.broker_id`
- `Fact_Shipments.quality_grade` → `Dim_Quality.quality_grade`
- `Fact_Shipments.shipment_date` → `Dim_Date.cal_date`
- `Dim_Broker.country_id` → `Dim_Country.country_id`
