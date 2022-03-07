CREATE TABLE IF NOT EXISTS "public"."dtst_report_rep" (
  pk_rep_id                 SERIAL PRIMARY KEY,
  rep_name                  TEXT                     NOT NULL,
  rep_secrets_manager_key   TEXT                     NOT NULL,
  rep_stored_procedure_name TEXT                     NOT NULL,
  rep_spreadsheet_id        TEXT                     NOT NULL,
  rep_sheet_name            TEXT                     NOT NULL,
  rep_range                 json                     NOT NULL,
  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by                CHARACTER(4)             NOT NULL,
  modified_at               TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_by               CHARACTER(4)             NOT NULL
);

