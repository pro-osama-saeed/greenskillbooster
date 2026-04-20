-- Tax rules
CREATE TABLE public.tax_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  rate numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view tax rules" ON public.tax_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tax rules" ON public.tax_rules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_tax_rules_updated
BEFORE UPDATE ON public.tax_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.tax_rules (code, name, rate, description) VALUES
  ('FST', 'Federal Sales Tax', 17, 'Standard FBR sales tax'),
  ('IT', 'Income Tax', 3, 'Withholding income tax'),
  ('KAPRA', 'KP Revenue Authority', 1, 'KPRA service tax'),
  ('PEPRA', 'Punjab Excise & Provincial Revenue', 4, 'PRA / PEPRA service tax'),
  ('ZERO', 'Zero-rated', 0, 'Zero-rated supplies'),
  ('EXEMPT', 'Exempt', 0, 'Tax-exempt supplies');

-- Documents (quotation / bill / invoice / delivery challan)
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type text NOT NULL CHECK (doc_type IN ('quotation','bill','invoice','challan')),
  doc_no text NOT NULL UNIQUE,
  client_id uuid REFERENCES public.clients(id) ON DELETE RESTRICT,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','cancelled')),
  notes text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_total numeric NOT NULL DEFAULT 0,
  grand_total numeric NOT NULL DEFAULT 0,
  converted_from uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view documents" ON public.documents
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Staff and admins can update documents" ON public.documents
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Admins can delete documents" ON public.documents
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_documents_updated
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_documents_type ON public.documents(doc_type);
CREATE INDEX idx_documents_client ON public.documents(client_id);

-- Document items
CREATE TABLE public.document_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text DEFAULT 'pcs',
  rate numeric NOT NULL DEFAULT 0,
  tax_rule_id uuid REFERENCES public.tax_rules(id) ON DELETE SET NULL,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  line_total numeric NOT NULL DEFAULT 0,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view document items" ON public.document_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert document items" ON public.document_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff and admins can update document items" ON public.document_items
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));
CREATE POLICY "Authenticated can delete document items" ON public.document_items
  FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_document_items_doc ON public.document_items(document_id);

-- Doc number generator
CREATE OR REPLACE FUNCTION public.generate_doc_no(_doc_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prefix text;
  _next int;
BEGIN
  _prefix := CASE _doc_type
    WHEN 'quotation' THEN 'QT'
    WHEN 'bill' THEN 'BL'
    WHEN 'invoice' THEN 'INV'
    WHEN 'challan' THEN 'DC'
    ELSE 'DOC'
  END;

  SELECT COALESCE(MAX((regexp_replace(doc_no, '^[A-Z]+-', ''))::int), 0) + 1
  INTO _next
  FROM public.documents
  WHERE doc_type = _doc_type;

  RETURN _prefix || '-' || LPAD(_next::text, 5, '0');
END;
$$;