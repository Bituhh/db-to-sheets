const {DBToSheets} = require('./index');
const {SecretManager} = require('../secret-manager');
jest.mock('../secret-manager');
const {Validate} = require('../helpers/validator');
jest.mock('../helpers/validator');
const {Database} = require('../database');
jest.mock('../database');
const {DatabaseConfig} = require('../database/database-config.model');
const {Random} = require('../helpers/random');
const stage = process.env.stage ?? 'dev';

describe('DBToSheets', () => {
  /**
   * @type {DBToSheets}
   */
  let dbToSheets;

  beforeEach(() => {
    dbToSheets = new DBToSheets();
  });

  it('should exist', () => {
    expect(dbToSheets).toBeDefined();
  });

  describe('run', () => {
    it('should exist', () => {
      expect(dbToSheets.run).toBeDefined();
    });

    it('should call Validate.number', async () => {
      const id = Random.number(10000);

      await dbToSheets.run(id);

      expect(Validate.number).toHaveBeenCalledWith(id, 'reportId');
    });

    it('should call getReport', () => {
      const spy = jest.spyOn(dbToSheets, 'getReport')
        .mockImplementation(() => null);
      const reportId = Random.number(100000);

      dbToSheets.run(reportId);

      expect(spy).toHaveBeenCalledWith(reportId);
    });
  });

  describe('getReport', () => {
    it('should call Validate.number', async () => {
      const id = Random.number(10000);

      await dbToSheets.getReport(id);

      expect(Validate.number).toHaveBeenCalledWith(id, 'id');
    });

    it('should call SecretManager.getSecret', async () => {
      await dbToSheets.getReport(1);

      expect(SecretManager.getSecret).toHaveBeenCalled();
    });

    it('should call SecretManager.getSecret with the parameter /db-to-sheets/{stage}/app_user_dts', async () => {
      await dbToSheets.getReport(1);

      expect(SecretManager.getSecret)
        .toHaveBeenCalledWith(`/db-to-sheets/${stage}/app_user_dts`);
    });

    it('should create a new instance of Database with return from getSecret', async () => {
      const expected = new DatabaseConfig();
      SecretManager.getSecret.mockImplementation(() => expected);

      await dbToSheets.getReport();

      expect(Database).toHaveBeenCalledWith(expected);
    });

    it('should call database.storedProcedure with correct stored procedure and args', async () => {
      await dbToSheets.getReport(1);

      expect(Database.prototype.storedProcedure)
        .toHaveBeenCalledWith('dtsf_get_report', {id: 1});
    });

    it('should call database.storedProcedure with random report id', async () => {
      const id = Random.number(100000);
      await dbToSheets.getReport(id);

      expect(Database.prototype.storedProcedure)
        .toHaveBeenCalledWith('dtsf_get_report', {id});
    });
  });
});
