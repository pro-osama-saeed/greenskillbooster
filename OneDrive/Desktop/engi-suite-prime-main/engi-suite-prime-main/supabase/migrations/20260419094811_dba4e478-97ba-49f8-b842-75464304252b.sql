
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  method text NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','bank','cheque','online','other')),
  reference text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_document ON public.payments(document_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view payments"
  ON public.payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff')));

CREATE POLICY "Staff and admins can update payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));

CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: recompute document status from payment total
CREATE OR REPLACE FUNCTION public.recalc_document_paid_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _doc_id uuid;
  _grand numeric;
  _paid numeric;
  _status text;
  _doc_type text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _doc_id := OLD.document_id;
  ELSE
    _doc_id := NEW.document_id;
  END IF;

  SELECT grand_total, status, doc_type INTO _grand, _status, _doc_type
  FROM public.documents WHERE id = _doc_id;

  IF _doc_type NOT IN ('invoice','bill') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO _paid
  FROM public.payments WHERE document_id = _doc_id;

  IF _paid >= _grand AND _grand > 0 AND _status <> 'paid' THEN
    UPDATE public.documents SET status = 'paid', updated_at = now() WHERE id = _doc_id;
  ELSIF _paid < _grand AND _status = 'paid' THEN
    UPDATE public.documents SET status = 'sent', updated_at = now() WHERE id = _doc_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_payments_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.recalc_document_paid_status();
