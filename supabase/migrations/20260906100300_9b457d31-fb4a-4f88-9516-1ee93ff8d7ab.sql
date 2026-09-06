CREATE TABLE public.fast_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
  child_name text NOT NULL DEFAULT '',
  applied_by text NOT NULL DEFAULT '',
  responded_by text NOT NULL DEFAULT '',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  note_14 text NOT NULL DEFAULT '',
  scores integer[] NOT NULL DEFAULT '{0,0,0,0}',
  primary_hypothesis text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fast_assessments TO authenticated;
GRANT ALL ON public.fast_assessments TO service_role;

ALTER TABLE public.fast_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own fast assessments"
ON public.fast_assessments FOR ALL TO authenticated
USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all fast assessments"
ON public.fast_assessments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_fast_assessments_updated_at
BEFORE UPDATE ON public.fast_assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();