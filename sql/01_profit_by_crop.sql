-- Profit and margin by crop
-- Answers: which products are actually worth buying/exporting more of?

SELECT
    c.crop,
    c.category,
    COUNT(*) AS total_shipments,
    SUM(f.total_revenue) AS total_revenue,
    SUM(f.shipment_cost) AS total_cost,
    SUM(f.profit_or_loss) AS total_profit,
    ROUND(100.0 * SUM(f.profit_or_loss) / NULLIF(SUM(f.total_revenue), 0), 2) AS profit_margin_pct
FROM fact_shipments f
JOIN dim_crop c ON f.crop_id = c.crop_id
GROUP BY c.crop, c.category
ORDER BY profit_margin_pct DESC;
