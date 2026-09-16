-- Profit and margin by destination country
-- Answers: which export market is actually most valuable, not just biggest?

SELECT
    co.country,
    co.region,
    COUNT(*) AS total_shipments,
    SUM(f.total_revenue) AS total_revenue,
    SUM(f.profit_or_loss) AS total_profit,
    ROUND(100.0 * SUM(f.profit_or_loss) / NULLIF(SUM(f.total_revenue), 0), 2) AS profit_margin_pct
FROM fact_shipments f
JOIN dim_broker b ON f.broker_id = b.broker_id
JOIN dim_country co ON b.country_id = co.country_id
GROUP BY co.country, co.region
ORDER BY profit_margin_pct DESC;
