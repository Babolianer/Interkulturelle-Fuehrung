-- AlterTable: Question – criterion, weak_expression, strong_expression
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "criterion" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "weak_expression" TEXT;
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "strong_expression" TEXT;

-- AlterTable: SurveyAnswer – value_durchschnitt
ALTER TABLE "survey_answers" ADD COLUMN IF NOT EXISTS "value_durchschnitt" INTEGER;
