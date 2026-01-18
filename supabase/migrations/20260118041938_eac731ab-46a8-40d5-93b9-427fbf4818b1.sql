-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create routes table (for grouping customers by delivery areas)
CREATE TABLE public.routes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user management with PIN auth
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    pin_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create customers table
CREATE TABLE public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    is_regular BOOLEAN NOT NULL DEFAULT false,
    default_units INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table with monthly billing support
CREATE TABLE public.orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    units INTEGER NOT NULL DEFAULT 1,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    billing_month DATE,
    delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    logged_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly_bills table to track monthly settlements
CREATE TABLE public.monthly_bills (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    billing_month DATE NOT NULL,
    total_units INTEGER NOT NULL DEFAULT 0,
    is_settled BOOLEAN NOT NULL DEFAULT false,
    settled_at TIMESTAMP WITH TIME ZONE,
    settled_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(customer_id, billing_month)
);

-- Enable RLS on all tables
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_bills ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Helper function to check if current user is staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'staff')
$$;

-- Helper function to check if user is authenticated (admin or staff)
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_staff()
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.is_admin());

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.is_admin());

-- RLS Policies for routes (admin only)
CREATE POLICY "Admins can manage routes"
ON public.routes FOR ALL
USING (public.is_admin());

CREATE POLICY "Authenticated users can view routes"
ON public.routes FOR SELECT
USING (public.is_authenticated_user());

-- RLS Policies for customers
CREATE POLICY "Authenticated users can view customers"
ON public.customers FOR SELECT
USING (public.is_authenticated_user());

CREATE POLICY "Admins can manage customers"
ON public.customers FOR ALL
USING (public.is_admin());

-- RLS Policies for orders
CREATE POLICY "Authenticated users can view orders"
ON public.orders FOR SELECT
USING (public.is_authenticated_user());

CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
WITH CHECK (public.is_authenticated_user());

CREATE POLICY "Admins can manage orders"
ON public.orders FOR ALL
USING (public.is_admin());

-- RLS Policies for monthly_bills
CREATE POLICY "Authenticated users can view bills"
ON public.monthly_bills FOR SELECT
USING (public.is_authenticated_user());

CREATE POLICY "Admins can manage bills"
ON public.monthly_bills FOR ALL
USING (public.is_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get current billing month
CREATE OR REPLACE FUNCTION public.get_current_billing_month()
RETURNS DATE
LANGUAGE SQL
STABLE
AS $$
  SELECT DATE_TRUNC('month', CURRENT_DATE)::DATE
$$;

-- Function to calculate customer monthly total
CREATE OR REPLACE FUNCTION public.get_customer_monthly_total(
  _customer_id UUID,
  _billing_month DATE DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(units), 0)::INTEGER
  FROM public.orders
  WHERE customer_id = _customer_id
    AND billing_month = COALESCE(_billing_month, public.get_current_billing_month())
$$;