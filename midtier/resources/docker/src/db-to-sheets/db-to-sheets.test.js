const {DBToSheets} = require('./index');
const {SecretManager} = require('../secret-manager');
jest.mock('../secret-manager');
const {Validate} = require('../helpers/validator');
jest.mock('../helpers/validator');
const {Database} = require('../database');
jest.mock('../database');
const {DatabaseConfig} = require('../models/database-config.model');
const {Random, CaseType} = require('../helpers/random');
const {ReportDetails} = require('../models/report-details.model');
const {DatabaseEngine} = require('../enums/database-engine.enum');
const {Spreadsheet} = require('../spreadsheet');
const {SpreadsheetRange} = require('../models/spreadsheet-range.model');
jest.mock('../spreadsheet');
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
    beforeEach(() => {
      const reportDetails = new ReportDetails({
        id: Random.number(100000),
        name: Random.alphanumeric(),
        sheetName: Random.alphanumeric(),
        storedProcedureName: Random.alphanumeric(),
        secretsManagerKey: `/db-to-sheets/${stage}/${Random.alphanumeric()}`,
        spreadsheetId: Random.alphanumeric(),
      });
      jest.spyOn(dbToSheets, 'getReportDetails')
        .mockReturnValue(Promise.resolve(reportDetails));
    });

    it('should exist', () => {
      expect(dbToSheets.run).toBeDefined();
    });

    it('should call Validate.number', async () => {
      const id = Random.number(10000);

      await dbToSheets.run(id);

      expect(Validate.number).toHaveBeenCalledWith(id, 'reportId');
    });

    it('should call getReportDetails', async () => {
      const spy = jest.spyOn(dbToSheets, 'getReportDetails');
      const reportId = Random.number(100000);

      await dbToSheets.run(reportId);

      expect(spy).toHaveBeenCalledWith(reportId);
    });

    it('should call getReportData', async () => {
      const spy = jest.spyOn(dbToSheets, 'getReportData')
        .mockImplementation(() => Promise.resolve());

      await dbToSheets.run(1);

      expect(spy).toHaveBeenCalled();
    });

    it('should call getReportData with data returned from getReportDetails', async () => {
      const expected = new ReportDetails({
        id: 1,
        name: 'Example Report',
        sheetName: 'Example A',
        storedProcedureName: 'dtsf_example_report',
        secretsManagerKey: `/db-to-sheets/${stage}/app_user_dts`,
        spreadsheetId: 'unpfubyo8b1iu23pn19n4p192u34ion1u4',
      });
      jest.spyOn(dbToSheets, 'getReportDetails')
        .mockReturnValue(Promise.resolve(expected));
      const getReportDataSpy = jest.spyOn(dbToSheets, 'getReportData')
        .mockImplementation(() => Promise.resolve());

      await dbToSheets.run(1);

      expect(getReportDataSpy)
        .toHaveBeenCalledWith(expected.secretsManagerKey, expected.storedProcedureName);
    });

    it('should throw error if getReportDetails returned nothing', async () => {
      jest.spyOn(dbToSheets, 'getReportDetails')
        .mockReturnValue(Promise.resolve());

      await expect(dbToSheets.run(1))
        .rejects
        .toThrow('No report could be found for the specified id!');
    });

    it('should call Spreadsheet.writeDataToSpreadsheet', async () => {
      const reportData = Random.table();
      const reportDetails = new ReportDetails({
        id: Random.number(100000),
        name: Random.alphanumeric(),
        sheetName: Random.alphanumeric(),
        storedProcedureName: Random.alphanumeric(),
        secretsManagerKey: `/db-to-sheets/${stage}/${Random.alphanumeric()}`,
        spreadsheetId: Random.alphanumeric(),
        range: {
          startColumn: Random.string(Random.number(2), CaseType.upper),
          endColumn: this.startColumn + Random.character(CaseType.upper),
          startRow: Random.number(10) + 1, // Remove zero
          endRow: this.startRow + Random.number(100),
        },
      });
      jest.spyOn(dbToSheets, 'getReportDetails')
        .mockReturnValue(Promise.resolve(reportDetails));
      jest.spyOn(dbToSheets, 'getReportData')
        .mockReturnValue(Promise.resolve(reportData));

      await dbToSheets.run(1);

      expect(Spreadsheet.prototype.writeDataToSpreadsheet)
        .toHaveBeenCalledWith(
          reportDetails.spreadsheetId,
          reportDetails.sheetName,
          reportDetails.range,
          reportData,
        );
    });
  });

  describe('getReportDetails', () => {
    it('should call Validate.number', async () => {
      const id = Random.number(10000);

      await dbToSheets.getReportDetails(id);

      expect(Validate.number).toHaveBeenCalledWith(id, 'id');
    });

    it('should call SecretManager.getSecret', async () => {
      await dbToSheets.getReportDetails(1);

      expect(SecretManager.getSecret).toHaveBeenCalled();
    });

    it('should call SecretManager.getSecret with the parameter /db-to-sheets/{stage}/app_user_dts', async () => {
      await dbToSheets.getReportDetails(1);

      expect(SecretManager.getSecret)
        .toHaveBeenCalledWith(`/db-to-sheets/${stage}/app_user_dts`);
    });

    it('should create a new instance of Database with return from getSecret', async () => {
      const expected = new DatabaseConfig({});
      SecretManager.getSecret.mockReturnValue(Promise.resolve(expected));

      await dbToSheets.getReportDetails(1);

      expect(Database).toHaveBeenCalledWith(expected);
    });

    it('should call database.storedProcedure with correct stored procedure and args', async () => {
      await dbToSheets.getReportDetails(1);

      expect(Database.prototype.storedProcedure)
        .toHaveBeenCalledWith('dtsf_get_report', {id: 1});
    });

    it('should call database.storedProcedure with random report id', async () => {
      const id = Random.number(100000);
      await dbToSheets.getReportDetails(id);

      expect(Database.prototype.storedProcedure)
        .toHaveBeenCalledWith('dtsf_get_report', {id});
    });

    it('should return data received from database.storedProcedure as ReportDetails object', async () => {
      const data = {[Random.alphanumeric()]: Random.alphanumeric()};
      Database.prototype.storedProcedure.mockReturnValue(Promise.resolve(data));

      const response = await dbToSheets.getReportDetails(1);

      expect(response).toEqual(new ReportDetails(data));
      expect(response).toBeInstanceOf(ReportDetails);
    });

    it('should return null when the data received from database.storedProcedure is null', async () => {
      Database.prototype.storedProcedure.mockReturnValue(Promise.resolve(null));

      const response = await dbToSheets.getReportDetails(1);

      expect(response).toEqual(null);
    });
  });

  describe('getReportData', () => {

    /**
     * @type {ReportDetails}
     */
    let reportDetails;
    beforeEach(() => {
      reportDetails = new ReportDetails({
        id: Random.number(100000),
        name: Random.alphanumeric(),
        sheetName: Random.alphanumeric(),
        storedProcedureName: Random.alphanumeric(),
        secretsManagerKey: `/db-to-sheets/${stage}/${Random.alphanumeric()}`,
        spreadsheetId: Random.alphanumeric(),
      });
      jest.spyOn(dbToSheets, 'getReportDetails')
        .mockReturnValue(Promise.resolve(reportDetails));
    });

    it('should exist', () => {
      expect(dbToSheets.getReportData).toBeDefined();
    });

    it('should call Validate.string for first argument', async () => {
      await dbToSheets.getReportData(reportDetails.secretsManagerKey, reportDetails.storedProcedureName);

      expect(Validate.string)
        .toHaveBeenCalledWith(reportDetails.secretsManagerKey, 'secretsManagerKey');
    });

    it('should call Validate.string for second argument', async () => {
      await dbToSheets.getReportData(reportDetails.secretsManagerKey, reportDetails.storedProcedureName);

      expect(Validate.string)
        .toHaveBeenCalledWith(reportDetails.storedProcedureName, 'storedProcedureName');
    });

    it('should call SecretManager.getSecret with the parameter that was passed', async () => {
      await dbToSheets.getReportData(reportDetails.secretsManagerKey, reportDetails.storedProcedureName);

      expect(SecretManager.getSecret)
        .toHaveBeenCalledWith(reportDetails.secretsManagerKey);
    });

    it('should create new instance of Database with values returned from SecretManager.getSecret', async () => {
      const expected = new DatabaseConfig({
        username: Random.alphanumeric(),
        password: Random.alphanumeric(),
        dbname: Random.alphanumeric(),
        port: Random.number(10000),
        engine: Math.random() > 0.5
          ? DatabaseEngine.postgres
          : DatabaseEngine.mysql,
        host: Random.alphanumeric(),
      });
      SecretManager.getSecret.mockReturnValue(Promise.resolve(expected));

      await dbToSheets.getReportData(reportDetails.secretsManagerKey, reportDetails.storedProcedureName);

      expect(Database).toHaveBeenCalledWith(expected);
    });

    it('should call database.storedProcedure with first argument as reportDetails.storedProcedureName and second as empty object', async () => {
      await dbToSheets.getReportData(reportDetails.secretsManagerKey, reportDetails.storedProcedureName);

      expect(Database.prototype.storedProcedure)
        .toHaveBeenCalledWith(reportDetails.storedProcedureName, {});
    });

    it('should return data received from database.storedProcedure', async () => {
      const data = Random.table();
      Database.prototype.storedProcedure.mockReturnValue(Promise.resolve(data));

      const response = await dbToSheets.getReportData(reportDetails.secretsManagerKey, reportDetails.storedProcedureName);

      expect(response).toBe(data);
    });
  });
});
