-- Add CHECK constraint to prevent negative total amounts
ALTER TABLE order_requests
ADD CONSTRAINT check_total_amount_positive CHECK (total_amount >= 0);

-- Add CHECK constraint to prevent negative delivery costs
ALTER TABLE order_requests
ADD CONSTRAINT check_delivery_cost_positive CHECK (delivery_cost >= 0);