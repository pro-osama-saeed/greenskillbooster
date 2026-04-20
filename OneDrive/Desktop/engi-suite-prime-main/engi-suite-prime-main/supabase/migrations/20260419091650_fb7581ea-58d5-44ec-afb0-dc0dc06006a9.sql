
drop policy if exists "Authenticated can update clients" on public.clients;
create policy "Staff and admins can update clients"
  on public.clients for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

drop policy if exists "Authenticated can update vendors" on public.vendors;
create policy "Staff and admins can update vendors"
  on public.vendors for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

drop policy if exists "Authenticated can update items" on public.inventory_items;
create policy "Staff and admins can update items"
  on public.inventory_items for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));
