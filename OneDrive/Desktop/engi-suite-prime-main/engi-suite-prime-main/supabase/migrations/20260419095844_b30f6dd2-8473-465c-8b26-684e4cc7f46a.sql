-- Extend doc_no generator to support 'po'
CREATE OR REPLACE FUNCTION public.generate_doc_no(_doc_type text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _prefix text;
  _next int;
BEGIN
  _prefix := CASE _doc_type
    WHEN 'quotation' THEN 'QT'
    WHEN 'bill' THEN 'BL'
    WHEN 'invoice' THEN 'INV'
    WHEN 'challan' THEN 'DC'
    WHEN 'po' THEN 'PO'
    ELSE 'DOC'
  END;

  SELECT COALESCE(MAX((regexp_replace(doc_no, '^[A-Z]+-', ''))::int), 0) + 1
  INTO _next
  FROM public.purchase_orders
  WHERE doc_type = _doc_type
  AND _doc_type = 'po';

  IF _doc_type <> 'po' THEN
    SELECT COALESCE(MAX((regexp_replace(doc_no, '^[A-Z]+-', ''))::int), 0) + 1
    INTO _next
    FROM public.documents
    WHERE doc_type = _doc_type;
  END IF;

  RETURN _prefix || '-' || LPAD(_next::text, 5, '0');
END;
$function$;

-- Purchase orders header
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_no text NOT NULL UNIQUE,
  doc_type text NOT NULL DEFAULT 'po',
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft', -- draft | sent | received | cancelled
  subtotal numeric NOT NULL DEFAULT 0,
  tax_total numeric NOT NULL DEFAULT 0,
  grand_total numeric NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- PO line items
CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
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

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- RLS purchase_orders
CREATE POLICY "Authenticated can view POs" ON public.purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert POs" ON public.purchase_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Staff and admins can update POs" ON public.purchase_orders FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Admins can delete POs" ON public.purchase_orders FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- RLS po items
CREATE POLICY "Authenticated can view PO items" ON public.purchase_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff and admins can insert PO items" ON public.purchase_order_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff and admins can update PO items" ON public.purchase_order_items FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));
CREATE POLICY "Staff and admins can delete PO items" ON public.purchase_order_items FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));

-- Trigger: when status -> 'received', add stock + log receipt; when reverting from received, restore
CREATE OR REPLACE FUNCTION public.handle_po_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _was_received boolean := false;
  _is_received boolean := false;
  _row record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _was_received := false;
    _is_received := (NEW.status = 'received');
  ELSE
    _was_received := (OLD.status = 'received');
    _is_received := (NEW.status = 'received');
  END IF;

  IF (NOT _was_received) AND _is_received THEN
    FOR _row IN SELECT item_id, quantity, rate FROM public.purchase_order_items WHERE po_id = NEW.id AND item_id IS NOT NULL LOOP
      UPDATE public.inventory_items
        SET current_stock = current_stock + _row.quantity,
            last_rate = _row.rate,
            updated_at = now()
        WHERE id = _row.item_id;
      INSERT INTO public.stock_movements (item_id, movement_type, quantity, document_id, document_type, document_no, notes, created_by)
        VALUES (_row.item_id, 'receipt', _row.quantity, NEW.id, 'po', NEW.doc_no, 'Auto-received from PO', NEW.created_by);
    END LOOP;
  END IF;

  IF _was_received AND (NOT _is_received) THEN
    FOR _row IN SELECT item_id, quantity FROM public.purchase_order_items WHERE po_id = NEW.id AND item_id IS NOT NULL LOOP
      UPDATE public.inventory_items
        SET current_stock = current_stock - _row.quantity,
            updated_at = now()
        WHERE id = _row.item_id;
      INSERT INTO public.stock_movements (item_id, movement_type, quantity, document_id, document_type, document_no, notes, created_by)
        VALUES (_row.item_id, 'reversal', _row.quantity, NEW.id, 'po', NEW.doc_no, 'Auto-reversed PO receipt', NEW.created_by);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_po_stock
AFTER INSERT OR UPDATE OF status ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.handle_po_stock();

CREATE TRIGGER trg_po_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_po_items_po_id ON public.purchase_order_items(po_id);
CREATE INDEX idx_po_vendor_id ON public.purchase_orders(vendor_id);
CREATE INDEX idx_po_status ON public.purchase_orders(status);