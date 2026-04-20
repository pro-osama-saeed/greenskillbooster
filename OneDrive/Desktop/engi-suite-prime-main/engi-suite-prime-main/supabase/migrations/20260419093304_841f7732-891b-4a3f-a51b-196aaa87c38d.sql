DROP POLICY "Authenticated can insert document items" ON public.document_items;
DROP POLICY "Authenticated can delete document items" ON public.document_items;

CREATE POLICY "Staff and admins can insert document items" ON public.document_items
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));

CREATE POLICY "Staff and admins can delete document items" ON public.document_items
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'staff'::app_role));