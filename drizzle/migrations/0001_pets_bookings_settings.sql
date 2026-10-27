CREATE TABLE public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('dog','cat')),
  is_sociable boolean NOT NULL,
  medical_notes text,
  routine_notes text,
  emergency_contact text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pets TO authenticated;
GRANT ALL ON public.pets TO service_role;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pets own or admin read" ON public.pets FOR SELECT TO authenticated USING (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Pets own or admin insert" ON public.pets FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Pets own or admin update" ON public.pets FOR UPDATE TO authenticated USING (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Pets admin delete" ON public.pets FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('boarding','pet_sitter')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','completed','cancelled')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_cents int NOT NULL CHECK (total_cents >= 0),
  customer_phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bookings own or admin read" ON public.bookings FOR SELECT TO authenticated USING (profile_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Bookings own insert pending" ON public.bookings FOR INSERT TO authenticated WITH CHECK ((profile_id = auth.uid() AND status = 'pending') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Bookings admin update" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Bookings admin delete" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.booking_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  UNIQUE (booking_id, pet_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_pets TO authenticated;
GRANT ALL ON public.booking_pets TO service_role;
ALTER TABLE public.booking_pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Booking pets own or admin read" ON public.booking_pets FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.profile_id = auth.uid()));
CREATE POLICY "Booking pets own insert" ON public.booking_pets FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(),'admin') OR (
    EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.profile_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_id AND p.profile_id = auth.uid())));
CREATE POLICY "Booking pets admin update" ON public.booking_pets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Booking pets admin delete" ON public.booking_pets FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boarding_base_price_cents int NOT NULL,
  sitter_base_price_cents int NOT NULL,
  extra_pet_price_cents int NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Settings admin insert" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Settings admin update" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admin profile update" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.promote_to_admin(_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(_email);
  IF _uid IS NULL THEN RETURN false; END IF;
  INSERT INTO public.user_roles(user_id, role) SELECT _uid, 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'admin');
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.promote_to_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO service_role;