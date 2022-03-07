DO
$body$
  BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM pg_catalog.pg_roles
        WHERE rolname = 'app_user_not') THEN
      CREATE USER app_user_dts WITH PASSWORD '<password_app_user>';
    END IF;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user_dts;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user_dts;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO app_user_dts;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user_dts;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user_dts;
  END
$body$;