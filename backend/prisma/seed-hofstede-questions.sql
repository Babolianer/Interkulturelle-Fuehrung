-- =============================================================================
-- Hofstede: Kulturdimensionen – Fragen mit Kriterien, Schwache/Starke Ausprägung, Referenzwert
-- Für SUPABASE: Im Dashboard → SQL Editor → New query → einfügen → Run
-- =============================================================================

ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "reference_value" INTEGER;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "criterion" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "weak_expression" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "strong_expression" TEXT;

-- 19 Kriterien (Reihenfolge fest). Bei bestehender Tabelle zuerst: DELETE FROM "questions" WHERE "dimension_name" = 'Hofstede';
INSERT INTO "questions" ("id", "dimension_name", "text", "criterion", "weak_expression", "strong_expression", "reference_value", "created_at") VALUES
  (gen_random_uuid(), 'Hofstede', 'Ungleichheit (Skala 0–100)', 'Ungleichheit', 'Soll: so gering wie möglich', 'Erwartet und erwünscht', 1, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Einbeziehung Entscheidungen (Skala 0–100)', 'Einbeziehung Entscheidungen', 'Partizipation', 'Anweisung', 50, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Privilegien/Statussymbol (Skala 0–100)', 'Privilegien/Statussymbol', 'Missbilligung', 'Erwartet, populär', 52, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Kommunikation (Skala 0–100)', 'Kommunikation', 'Indirekt, Harmonie', 'Direkt, Aufrichtigkeit', 14, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Beziehung / Aufgabe: Priorität (Skala 0–100)', 'Beziehung / Aufgabe: Priorität', 'Beziehung', 'Aufgabe', 8, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Wertepriorität (Skala 0–100)', 'Wertepriorität', 'Beziehung', 'Geld / Dinge', 69, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Sympathie (Skala 0–100)', 'Sympathie', 'Schwache Menschen', 'Starke Menschen', 68, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Arbeit (Skala 0–100)', 'Arbeit', 'Arbeiten, um zu leben', 'Leben, um zu arbeiten', 28, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Gefühle/Fakten (Skala 0–100)', 'Gefühle/Fakten', 'Beide Elternteile', 'Vater=Fakten, Mutter= Gefühle', 88, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Stress (Skala 0–100)', 'Stress', 'Gering | subjekt. Wohlbefinden', 'Hoch | subjekt. Angst', 95, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Andersartigkeit (Skala 0–100)', 'Andersartigkeit', 'Seltsam, Toleranz', 'Gefährlich, Unterdrückung', 23, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Zeit (Skala 0–100)', 'Zeit', '= Orientierungsrahmen', '= Geld', 57, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Zeitbezug (Skala 0–100)', 'Zeitbezug', 'Gegenwart, schnelles Ergebnis', 'Zukunft, Ergebnis eher langsam', 43, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Tradition (Skala 0–100)', 'Tradition', 'Respekt', 'Anpassung an Gegebenheiten', 40, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Erklärbarkeit (Skala 0–100)', 'Erklärbarkeit', 'Absolute Wahrheit', 'Pragmatismus', 79, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Mimik (Skala 0–100)', 'Mimik', 'Ernste Mimik= Seriosität', 'Freundlich, Optimistisch', 8, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Soziale & religiöse Regeln (Skala 0–100)', 'Soziale & religiöse Regeln', 'Streng', 'Pragmatisch', 96, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Lebensgefühl (Skala 0–100)', 'Lebensgefühl', 'Askese lobenswert', 'Genuß = Teil des Lebensgefühls', 85, NOW()),
  (gen_random_uuid(), 'Hofstede', 'Eigene Bedürfnisse (Skala 0–100)', 'Eigene Bedürfnisse', 'Sekundär (für Familie)', 'Selbstverwirklichung = Lebensziel', 77, NOW());
