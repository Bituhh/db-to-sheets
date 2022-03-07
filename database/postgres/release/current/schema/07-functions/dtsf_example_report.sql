CREATE OR REPLACE FUNCTION "public"."dtsf_example_report"()
  RETURNS TABLE (
    "id"                  INTEGER,
    "name"                TEXT,
    "storedProcedureName" TEXT,
    "secretsManagerId"    TEXT,
    "spreadsheetId"       TEXT,
    "sheetName"           TEXT,
    "range"               json
  )
  STABLE
AS
$body$
BEGIN
  RETURN QUERY
    SELECT rep.pk_rep_id,
           rep.rep_name,
           rep.rep_stored_procedure_name,
           rep.rep_secrets_manager_key,
           rep.rep_spreadsheet_id,
           rep.rep_sheet_name,
           rep.rep_range
    FROM dtst_report_rep rep;
END;
$body$ LANGUAGE plpgsql;

