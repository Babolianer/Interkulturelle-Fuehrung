-- =============================================================================
-- Interkulturelle Führung – Supabase Datenbank-Schema
-- Einmalig im Supabase Dashboard unter „SQL Editor“ ausführen (New query → einfügen → Run).
-- =============================================================================

-- Enum für Benutzerrolle
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- Tabelle: users
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "course_number" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Tabelle: surveys
CREATE TABLE "surveys" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "surveys_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "surveys_user_id_idx" ON "surveys"("user_id");

-- Tabelle: questions
CREATE TABLE "questions" (
  "id" TEXT NOT NULL,
  "dimension_name" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "criterion" TEXT,
  "weak_expression" TEXT,
  "strong_expression" TEXT,
  "reference_value" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "questions_dimension_name_idx" ON "questions"("dimension_name");

-- Tabelle: survey_answers
CREATE TABLE "survey_answers" (
  "id" TEXT NOT NULL,
  "survey_id" TEXT NOT NULL,
  "question_id" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "value_durchschnitt" INTEGER,
  CONSTRAINT "survey_answers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "survey_answers_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "survey_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "survey_answers_survey_id_idx" ON "survey_answers"("survey_id");
CREATE INDEX "survey_answers_question_id_idx" ON "survey_answers"("question_id");
CREATE UNIQUE INDEX "survey_answers_survey_id_question_id_key" ON "survey_answers"("survey_id", "question_id");
