
-- Stock movements table
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('issue','receipt','adjustment','reversal')),
  quantity numeric NOT NULL,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  document_type text,
  document_no text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_item ON public.stock_movements(item_id);
CREATE INDEX idx_stock_movements_document ON public.stock_movements(document_id);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view stock movements"
  ON public.stock_movements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff and admins can insert stock movements"
  ON public.stock_movements FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'staff'));

CREATE POLICY "Admins can delete stock movements"
  ON public.stock_movements FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- Helper: which statuses cause stock to be deducted
CREATE OR REPLACE FUNCTION public.is_issuing_status(_status text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT _status IN ('sent','paid');
$$;

-- Trigger function: on documents UPDATE/INSERT, if status transitions into issuing, deduct stock
CREATE OR REPLACE FUNCTION public.handle_document_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _was_issuing boolean := false;
  _is_issuing boolean := false;
  _row record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _was_issuing := false;
    _is_issuing := public.is_issuing_status(NEW.status);
  ELSE
    _was_issuing := public.is_issuing_status(OLD.status);
    _is_issuing := public.is_issuing_status(NEW.status);
  END IF;

  -- Only act on document types that affect stock
  IF NEW.doc_type NOT IN ('invoice','bill','challan','quotation') THEN
    RETURN NEW;
  END IF;

  -- Transition: not issuing -> issuing => deduct stock
  IF (NOT _was_issuing) AND _is_issuing THEN
    FOR _row IN
      SELECT item_id, quantity FROM public.document_items
      WHERE document_id = NEW.id AND item_id IS NOT NULL
    LOOP
      UPDATE public.inventory_items
        SET current_stock = current_stock - _row.quantity,
            updated_at = now()
        WHERE id = _row.item_id;
      INSERT INTO public.stock_movements (item_id, movement_type, quantity, document_id, document_type, document_no, notes, created_by)
        VALUES (_row.item_id, 'issue', _row.quantity, NEW.id, NEW.doc_type, NEW.doc_no, 'Auto-deducted on status change to ' || NEW.status, NEW.created_by);
    END LOOP;
  END IF;

  -- Transition: issuing -> not issuing => restore stock (reversal)
  IF _was_issuing AND (NOT _is_issuing) THEN
    FOR _row IN
      SELECT item_id, quantity FROM public.document_items
      WHERE document_id = NEW.id AND item_id IS NOT NULL
    LOOP
      UPDATE public.inventory_items
        SET current_stock = current_stock + _row.quantity,
            updated_at = now()
        WHERE id = _row.item_id;
      INSERT INTO public.stock_movements (item_id, movement_type, quantity, document_id, document_type, document_no, notes, created_by)
        VALUES (_row.item_id, 'reversal', _row.quantity, NEW.id, NEW.doc_type, NEW.doc_no, 'Auto-restored on status change to ' || NEW.status, NEW.created_by);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_documents_stock
AFTER INSERT OR UPDATE OF status ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.handle_document_stock();

-- Also: when a document is converted into a NEW invoice (insert with status='sent' OR creating invoice from quotation)
-- The trigger above already covers INSERT path via _was_issuing=false logic.

-- updated_at trigger for stock_movements not needed (no updated_at column)
