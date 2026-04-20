CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (
    user_id, email, full_name, phone, organization, role_interest, approval_status, approved_at
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'organization',
    new.raw_user_meta_data->>'role_interest',
    'pending',
    null
  );

  insert into public.user_roles (user_id, role) values (new.id, 'staff');

  return new;
end;
$function$;