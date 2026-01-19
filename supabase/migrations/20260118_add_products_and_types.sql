-- Add product_type, order_type, and price to orders table
ALTER TABLE public.orders 
ADD COLUMN product_type text DEFAULT 'bottle',
ADD COLUMN order_type text DEFAULT 'regular',
ADD COLUMN price numeric DEFAULT 0;

-- Comment on columns for clarity
COMMENT ON COLUMN public.orders.product_type IS 'Type of product: bottle or jug';
COMMENT ON COLUMN public.orders.order_type IS 'Type of order: regular or bulk';
