-- Broker performance ranking (window function)
-- Answers: which of our 25 brokers are actually most profitable to work with?

SELECT
    b.broker_name,
    co.country,
    COUNT(*) AS total_shipments,
    SUM(f.profit_or_loss) AS total_profit,
    ROUND(100.0 * SUM(f.profit_or_loss) / NULLIF(SUM(f.total_revenue), 0), 2) AS profit_margin_pct,
    RANK() OVER (ORDER BY SUM(f.profit_or_loss) DESC) AS profit_rank
FROM fact_shipments f
JOIN dim_broker b ON f.broker_id = b.broker_id
JOIN dim_country co ON b.country_id = co.country_id
GROUP BY b.broker_name, co.country
ORDER BY profit_rank;
