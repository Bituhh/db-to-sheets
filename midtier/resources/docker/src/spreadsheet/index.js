const {GetObjectCommand, S3Client} = require('@aws-sdk/client-s3');
const s3Client = new S3Client({});
const fs = require('fs');
const path = require('path');
const googleapis = require('@googleapis/sheets');
const {Validate} = require('../helpers/validator');

class Spreadsheet {
  /**
   * @type {string[]}
   */
  static scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  /**
   * @type {googleapis.v4.Sheets}
   */
  #sheets;

  /**
   * @param {string} spreadsheetId
   * @param {string} sheetName
   * @param {SpreadsheetRange} range
   * @param {{[key: string]: *}[]} values
   * @returns {Promise<void>}
   */
  async writeDataToSpreadsheet(spreadsheetId, sheetName, range, values) {
    Validate.string(spreadsheetId, 'spreadsheetId');
    Validate.string(sheetName, 'sheetName');
    Validate.object(range, 'range');
    Validate.object(values, 'values');

    const credentialsPath = path.resolve(`${__dirname}/../google-api-credentials.json`);
    await Spreadsheet.#createCredentialsFile(credentialsPath);

    const rangeString = `${sheetName}!${range.toStringFormat()}`;
    await this.#authenticate(credentialsPath);
    await this.#clearRange(spreadsheetId, rangeString);
    await this.#updateRange(spreadsheetId, rangeString, values);

    Spreadsheet.#deleteCredentialsFile(credentialsPath);
  }

  /**
   * @param {string} keyPath
   * @returns {Promise<void>}
   */
  async #authenticate(keyPath) {
    const auth = new googleapis.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: Spreadsheet.scopes,
    });
    const authClient = await auth.getClient();
    this.#sheets = googleapis.sheets({version: 'v4', auth: authClient});
  }

  /**
   * @param {string} spreadsheetId
   * @param {string} range
   */
  async #clearRange(spreadsheetId, range) {
    await this.#sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
  }

  /**
   * @param {string} spreadsheetId
   * @param {string} range
   * @param {{[key: string]: *}[]} values
   */
  async #updateRange(spreadsheetId, range, values) {
    const modifiedValues = values.map(x => Object.values(x).map(y => typeof y === 'object' ? JSON.stringify(y) : y));
    await this.#sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: modifiedValues,
      },
    });
  }

  /**
   * @param {string} path
   * @returns {Promise<void>}
   */
  static async #createCredentialsFile(path) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: 'db-to-sheets-assets',
      Key: 'db-to-sheets-credentials.json',
    });
    const response = await s3Client.send(getObjectCommand);
    await new Promise((resolve, reject) => {
      const writer = response.Body.pipe(fs.createWriteStream(path));
      writer.on('error', err => {
        reject(err);
      });
      writer.on('finish', () => {
        resolve();
      });
    });
  }

  static #deleteCredentialsFile(path) {
    fs.rmSync(path);
  }
}

module.exports = {Spreadsheet};
