DROP FUNCTION IF EXISTS "public"."dtsf_get_report"(i_report_id INTEGER);
CREATE OR REPLACE FUNCTION "public"."dtsf_get_report"(i_report_id INTEGER)
  RETURNS json
  STABLE
AS
$body$
BEGIN
  RETURN (
    SELECT JSON_BUILD_OBJECT(
               'id', rep.pk_rep_id,
               'name', rep.rep_name,
               'storedProcedureName', rep.rep_stored_procedure_name,
               'secretsManagerKey', rep.rep_secrets_manager_key,
               'spreadsheetId', rep.rep_spreadsheet_id,
               'sheetName', rep.rep_sheet_name,
               'range', rep.rep_range
             )
    FROM dtst_report_rep rep
    WHERE pk_rep_id = i_report_id
  );
END ;
$body$ LANGUAGE plpgsql;
