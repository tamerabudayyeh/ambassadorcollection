-- Payment System Schema
-- This migration adds comprehensive payment processing capabilities

-- Payment methods table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- card, bank_account, etc.
  card_brand VARCHAR(50), -- visa, mastercard, amex, etc.
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  billing_details JSONB,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment intents table for tracking Stripe payment intents
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- requires_payment_method, requires_confirmation, succeeded, etc.
  payment_method_id UUID REFERENCES payment_methods(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table for comprehensive payment tracking
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payment_intent_id UUID REFERENCES payment_intents(id),
  stripe_charge_id VARCHAR(255),
  transaction_type VARCHAR(50) NOT NULL, -- payment, refund, partial_refund, chargeback
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- pending, succeeded, failed, canceled
  gateway_response JSONB,
  failure_reason VARCHAR(255),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds table for refund management
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES payment_transactions(id),
  stripe_refund_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'USD',
  reason VARCHAR(100), -- duplicate, fraudulent, requested_by_customer
  status VARCHAR(50) NOT NULL, -- pending, succeeded, failed, canceled
  staff_member_id UUID, -- Who initiated the refund
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment schedules for deposit handling and payment plans
CREATE TABLE payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  schedule_type VARCHAR(50) NOT NULL, -- deposit, balance, installment
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'USD',
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue, failed
  payment_intent_id UUID REFERENCES payment_intents(id),
  auto_charge BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Currency rates table for multi-currency support
CREATE TABLE currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 6) NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source VARCHAR(100) NOT NULL, -- 'stripe', 'fixer.io', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(base_currency, target_currency, effective_date)
);

-- Corporate billing accounts
CREATE TABLE corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  billing_email VARCHAR(255) NOT NULL,
  billing_address JSONB NOT NULL,
  tax_id VARCHAR(100),
  payment_terms INTEGER DEFAULT 30, -- Net 30, etc.
  credit_limit INTEGER, -- In cents
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corporate bookings link
CREATE TABLE corporate_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  corporate_account_id UUID REFERENCES corporate_accounts(id),
  invoice_number VARCHAR(100),
  purchase_order VARCHAR(100),
  billing_status VARCHAR(50) DEFAULT 'pending', -- pending, invoiced, paid, overdue
  billed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_payment_methods_guest_id ON payment_methods(guest_id);
CREATE INDEX idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_intents_booking_id ON payment_intents(booking_id);
CREATE INDEX idx_payment_intents_stripe_id ON payment_intents(stripe_payment_intent_id);
CREATE INDEX idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_stripe_charge ON payment_transactions(stripe_charge_id);
CREATE INDEX idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX idx_payment_schedules_booking_id ON payment_schedules(booking_id);
CREATE INDEX idx_payment_schedules_due_date ON payment_schedules(due_date);
CREATE INDEX idx_currency_rates_lookup ON currency_rates(base_currency, target_currency, effective_date);
CREATE INDEX idx_corporate_bookings_account ON corporate_bookings(corporate_account_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON payment_intents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_corporate_accounts_updated_at BEFORE UPDATE ON corporate_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Payment methods - guests can only see their own
CREATE POLICY "Users can view own payment methods" ON payment_methods FOR SELECT USING (auth.uid()::text = guest_id::text);
CREATE POLICY "Users can insert own payment methods" ON payment_methods FOR INSERT WITH CHECK (auth.uid()::text = guest_id::text);
CREATE POLICY "Users can update own payment methods" ON payment_methods FOR UPDATE USING (auth.uid()::text = guest_id::text);

-- Payment intents - linked to bookings
CREATE POLICY "Users can view payment intents for their bookings" ON payment_intents FOR SELECT USING (
  EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payment_intents.booking_id AND bookings.guest_id::text = auth.uid()::text)
);

-- Payment transactions - read-only for guests
CREATE POLICY "Users can view transactions for their bookings" ON payment_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payment_transactions.booking_id AND bookings.guest_id::text = auth.uid()::text)
);

-- Payment schedules - guests can view their own
CREATE POLICY "Users can view payment schedules for their bookings" ON payment_schedules FOR SELECT USING (
  EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payment_schedules.booking_id AND bookings.guest_id::text = auth.uid()::text)
);

-- Currency rates - public read access
CREATE POLICY "Currency rates are publicly readable" ON currency_rates FOR SELECT TO authenticated, anon USING (true);

-- Staff can access all payment data (will need staff role system)
-- For now, we'll add admin policies later when we implement staff authentication

-- Insert default currency rates (USD base)
INSERT INTO currency_rates (base_currency, target_currency, rate, source) VALUES
('USD', 'USD', 1.000000, 'manual'),
('USD', 'EUR', 0.850000, 'manual'),
('USD', 'GBP', 0.750000, 'manual'),
('USD', 'CAD', 1.350000, 'manual'),
('USD', 'AUD', 1.450000, 'manual')
ON CONFLICT (base_currency, target_currency, effective_date) DO NOTHING;