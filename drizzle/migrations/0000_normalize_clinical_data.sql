-- ABC logs: normalized columns (old columns kept, deprecated)
ALTER TABLE public.abc_logs
  ADD COLUMN behavior_category text NOT NULL DEFAULT 'Outro',
  ADD COLUMN behavior_detail text,
  ADD COLUMN severity_level text NOT NULL DEFAULT 'Média',
  ADD COLUMN phase_label text NOT NULL DEFAULT 'Não classificado',
  ADD COLUMN function_label text;

ALTER TABLE public.abc_logs
  ADD CONSTRAINT abc_behavior_category_chk CHECK (behavior_category IN ('Agressão','Autolesão','Choro/grito','Fuga/esquiva','Estereotipia','Recusa','Outro')),
  ADD CONSTRAINT abc_severity_level_chk CHECK (severity_level IN ('Leve','Média','Alta')),
  ADD CONSTRAINT abc_phase_label_chk CHECK (phase_label IN ('Linha de base','Intervenção','Não classificado')),
  ADD CONSTRAINT abc_function_label_chk CHECK (function_label IS NULL OR function_label IN ('Esquiva/fuga','Atenção','Tangível','Sensorial/automática'));

CREATE OR REPLACE FUNCTION public.abc_map_behavior(_b text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE lower(trim(coalesce(_b,'')))
    WHEN 'agressão' THEN 'Agressão' WHEN 'agressao' THEN 'Agressão'
    WHEN 'autolesão' THEN 'Autolesão' WHEN 'autolesao' THEN 'Autolesão'
    WHEN 'choro/grito' THEN 'Choro/grito'
    WHEN 'fuga/esquiva' THEN 'Fuga/esquiva'
    WHEN 'estereotipia' THEN 'Estereotipia'
    WHEN 'recusa' THEN 'Recusa'
    ELSE 'Outro' END
$$;

CREATE OR REPLACE FUNCTION public.abc_map_function(_f text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _f IS NULL THEN NULL
    WHEN lower(_f) LIKE '%fuga%' OR lower(_f) LIKE '%esquiva%' THEN 'Esquiva/fuga'
    WHEN lower(_f) LIKE 'aten%' THEN 'Atenção'
    WHEN lower(_f) LIKE 'tang%' THEN 'Tangível'
    WHEN lower(_f) LIKE 'sensorial%' OR lower(_f) LIKE 'autom%' THEN 'Sensorial/automática'
    ELSE NULL END
$$;

UPDATE public.abc_logs SET
  behavior_category = public.abc_map_behavior(behavior),
  behavior_detail = CASE WHEN public.abc_map_behavior(behavior) = 'Outro' THEN behavior ELSE NULL END,
  severity_level = CASE WHEN severity <= 1 THEN 'Leve' WHEN severity <= 3 THEN 'Média' ELSE 'Alta' END,
  phase_label = CASE phase WHEN 'baseline' THEN 'Linha de base' WHEN 'intervention' THEN 'Intervenção' ELSE 'Não classificado' END,
  function_label = public.abc_map_function(hypothesized_function);

COMMENT ON COLUMN public.abc_logs.severity IS 'DEPRECATED: replaced by severity_level';
COMMENT ON COLUMN public.abc_logs.phase IS 'DEPRECATED: replaced by phase_label';
COMMENT ON COLUMN public.abc_logs.hypothesized_function IS 'DEPRECATED: replaced by function_label';

-- Children: auto capitalize name
CREATE OR REPLACE FUNCTION public.capitalize_child_name() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.name = initcap(lower(regexp_replace(trim(NEW.name), '\s+', ' ', 'g')));
  RETURN NEW;
END;
$$;
CREATE TRIGGER children_capitalize_name BEFORE INSERT OR UPDATE OF name ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.capitalize_child_name();
UPDATE public.children SET name = name;

-- FAST: patient required + aggregated result
ALTER TABLE public.fast_assessments ALTER COLUMN child_id SET NOT NULL;
ALTER TABLE public.fast_assessments ADD COLUMN resultado_agregado jsonb;
UPDATE public.fast_assessments SET resultado_agregado = jsonb_build_object(
  'social_atencao', scores[1], 'social_fuga', scores[2],
  'automatico_sensorial', scores[3], 'automatico_dor', scores[4],
  'hipotese_primaria', primary_hypothesis, 'respondido_por', responded_by, 'data', created_at);