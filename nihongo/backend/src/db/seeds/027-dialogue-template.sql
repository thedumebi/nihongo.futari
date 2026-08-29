-- The conversation exercise.
--
-- `choice` input, but NOT the shared `choice-id` grader: a wrong reply has to
-- carry the reason it is wrong, and `gradeAnswer` returns one boolean and one
-- canonical string. The dialogue card grades in the view instead, the way
-- handwriting already does — see `dialogue-reply` handling in study.vue.
--
-- Not `first_exposure_only`. Multiple choice gets out of the way for
-- vocabulary because producing beats recognising, but here the choice IS the
-- exercise: picking the right register and the right particle from plausible
-- alternatives is the skill.

INSERT INTO exercise_templates
  (id, code, language_id, name, applies_to_kinds, applies_to_facets, input_mode, grader_code, requires, first_exposure_only, config, weight, active)
VALUES
  ('tpl-dialogue-reply', 'dialogue-reply', NULL, 'Choose your reply',
   ARRAY['dialogue'], ARRAY['usage'],
   'choice', 'dialogue-reply', '{}', false, '{}', 6, true)
ON CONFLICT (id) DO NOTHING;

-- The default template for a dialogue's usage facet.
INSERT INTO kind_facet_templates (id, language_id, kind, facet, template_id, weight, first_exposure_only)
VALUES ('kft-dialogue-usage', 'lang-ja', 'dialogue', 'usage', 'tpl-dialogue-reply', 10, false)
ON CONFLICT (id) DO NOTHING;
