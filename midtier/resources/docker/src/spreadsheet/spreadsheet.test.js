const {Spreadsheet} = require('./index');
const fs = require('fs');
jest.mock('fs');
const {auth, sheets} = require('@googleapis/sheets');
jest.mock('@googleapis/sheets');
const {GetObjectCommand, S3Client} = require('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-s3');
const {Random, CaseType} = require('../helpers/random');
const path = require('path');
const exp = require('constants');
const {Validate} = require('../helpers/validator');
const {SpreadsheetRange} = require('../models/spreadsheet-range.model');
jest.mock('../helpers/validator');

describe('Spreadsheet', () => {
  /**
   * @type {Spreadsheet}
   */
  let spreadsheet;

  beforeEach(() => {
    spreadsheet = new Spreadsheet();
  });

  it('should exist', () => {
    expect(Spreadsheet).toBeDefined();
    expect(spreadsheet).toBeDefined();
  });

  it('should have only one instance of S3Client', () => {
    expect(S3Client.mock.instances.length).toEqual(1);
    expect(S3Client).toHaveBeenCalledWith({});
  });

  it('should have Spreadsheet.scopes', () => {
    expect(Spreadsheet.scopes).toBeDefined();
    expect(Spreadsheet.scopes)
      .toEqual(['https://www.googleapis.com/auth/spreadsheets']);
  });

  describe('writeDataToSpreadsheet', () => {
    let sendReturn;
    let spreadsheetsValuesClear;
    let spreadsheetsValuesUpdate;
    let spreadsheetId;
    let sheetName;
    let range;
    let values;
    beforeEach(() => {
      sendReturn = {
        Body: {
          pipe: jest.fn().mockReturnValue({
            on: jest.fn().mockImplementation((event, cb) => {
              if (event === 'finish') {
                cb();
              }
            }),
          }),
        },
      };
      S3Client.prototype.send.mockReturnValue(Promise.resolve(sendReturn));
      spreadsheetsValuesClear = jest.fn().mockReturnValue(Promise.resolve());
      spreadsheetsValuesUpdate = jest.fn().mockReturnValue(Promise.resolve());
      sheets.mockReturnValue({
        spreadsheets: {
          values: {
            clear: spreadsheetsValuesClear,
            update: spreadsheetsValuesUpdate,
          },
        },
      });

      spreadsheetId = Random.alphanumeric();
      sheetName = Random.alphanumeric();
      range = new SpreadsheetRange({
        startColumn: Random.string(Random.number(2), CaseType.upper),
        endColumn: this.startColumn + Random.character(CaseType.upper),
        startRow: Random.number(10) + 1, // Remove zero
        endRow: this.startRow + Random.number(100),
      });
      values = Random.table(2, 10);
    });

    it('should exist', () => {
      expect(spreadsheet.writeDataToSpreadsheet).toBeDefined();
    });

    it('should return type Promise', () => {
      const data = spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);
      expect(data).toBeInstanceOf(Promise);
    });

    it('should call Validate.string for spreadsheetId', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(Validate.string)
        .toHaveBeenCalledWith(spreadsheetId, 'spreadsheetId');
    });

    it('should call Validate.string for sheetName', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(Validate.string)
        .toHaveBeenCalledWith(sheetName, 'sheetName');
    });

    it('should call Validate.object for range', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(Validate.object)
        .toHaveBeenCalledWith(range, 'range');
    });

    it('should call Validate.object for values', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(Validate.object)
        .toHaveBeenCalledWith(values, 'values');
    });

    it('should create GetObjectCommand with bucket and key defined', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'db-to-sheets-assets',
        Key: 'db-to-sheets-credentials.json',
      });
    });

    it('should call s3Client.send with object returned form GetObjectCommand', async () => {
      const expected = {[Random.alphanumeric()]: Random.alphanumeric()};
      GetObjectCommand.mockReturnValue(expected);

      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(S3Client.prototype.send).toHaveBeenCalledWith(expected);
    });

    it('should call pipe from response.Body', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      const credentialsPath = path.resolve(`${__dirname}/../google-api-credentials.json`);
      expect(sendReturn.Body.pipe)
        .toHaveBeenCalledWith(fs.createWriteStream(credentialsPath));
    });

    it('should call pipe.on for \'error\'', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(sendReturn.Body.pipe().on)
        .toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should call pipe.on for \'finish\'', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(sendReturn.Body.pipe().on)
        .toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should call auth.GoogleAuth with keyFile and scope passed', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      const credentialsPath = path.resolve(`${__dirname}/../google-api-credentials.json`);
      expect(auth.GoogleAuth).toHaveBeenCalledWith({
        keyFile: credentialsPath,
        scopes: Spreadsheet.scopes,
      });
    });

    it('should pass value returned from GoogleAuth to sheets', async () => {
      const expected = {[Random.alphanumeric()]: Random.alphanumeric()};
      auth.GoogleAuth.mockReturnValue({getClient: () => Promise.resolve(expected)});

      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(sheets).toHaveBeenCalledWith({version: 'v4', auth: expected});
    });

    it('should call sheets.spreadsheets.values.clear with spreadsheetId and specified range from DB', async () => {
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(spreadsheetsValuesClear)
        .toHaveBeenCalledWith({
          spreadsheetId,
          range: `${sheetName}!${range.toStringFormat()}`,
        });
    });

    it('should call sheets.spreadsheets.values.update', async () => {
      values = Random.table(10, 10);
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      const data = [];
      for (const value of values) {
        data.push(Object.values(value));
      }

      expect(spreadsheetsValuesUpdate).toHaveBeenCalledWith({
        spreadsheetId,
        range: `${sheetName}!${range.toStringFormat()}`,
        valueInputOption: 'RAW',
        resource: {
          values: data,
        },
      });
    });

    it('should ensure sheets.spreadsheets.values.update is called with object as string if json value is passed to values', async () => {
      values = Random.table(10, 10);
      for (let i = 0; i < values.length; i++) {
        if (Math.random() <= 0.33) { // One third of the time, create a random object.
          const keys = Object.keys(values[i]);
          const randomKey = keys[Random.number(keys.length)];
          values[i][randomKey] = Random.object();
        }
      }
      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      const data = [];
      for (const value of values) {
        const objectValues = Object.values(value);
        for (let i = 0; i < objectValues.length; i++) {
          if (typeof objectValues[i] === 'object') {
            objectValues[i] = JSON.stringify(objectValues[i]);
          }
        }
        data.push(objectValues);
      }
      expect(spreadsheetsValuesUpdate).toHaveBeenCalledWith({
        spreadsheetId,
        range: `${sheetName}!${range.toStringFormat()}`,
        valueInputOption: 'RAW',
        resource: {
          values: data,
        },
      });
    });

    it('should call fs.rmSync to delete google-crendentials.json file', async () => {
      const credentialsPath = path.resolve(`${__dirname}/../google-api-credentials.json`);

      await spreadsheet.writeDataToSpreadsheet(spreadsheetId, sheetName, range, values);

      expect(fs.rmSync).toBeCalledWith(credentialsPath);
    });
  });
});
