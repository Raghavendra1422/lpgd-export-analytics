-- Crop x Country profit margin cross-tab
-- Answers: which specific crop-market combination performs best/worst?
-- (A crop that looks fine overall can still lose money in one specific country.)

SELECT
    c.crop,
    co.country,
    COUNT(*) AS total_shipments,
    SUM(f.profit_or_loss) AS total_profit,
    ROUND(100.0 * SUM(f.profit_or_loss) / NULLIF(SUM(f.total_revenue), 0), 2) AS profit_margin_pct
FROM fact_shipments f
JOIN dim_crop c ON f.crop_id = c.crop_id
JOIN dim_broker b ON f.broker_id = b.broker_id
JOIN dim_country co ON b.country_id = co.country_id
GROUP BY c.crop, co.country
ORDER BY c.crop, profit_margin_pct DESC;
