const {SecretManager} = require('../secret-manager');
const {Database} = require('../database');
const {ReportDetails} = require('../models/report-details.model');
const {Spreadsheet} = require('../spreadsheet');
const {Validate} = require('../helpers/validator');

const stage = process.env.stage ?? 'dev';

class DBToSheets {
  /**
   * @param {number} reportId
   * @returns {Promise<void>}
   */
  async run(reportId) {
    Validate.number(reportId, 'reportId');
    const reportDetails = await this.getReportDetails(reportId);
    if (!reportDetails) {
      throw new Error('No report could be found for the specified id!');
    }
    const reportData = await this.getReportData(
      reportDetails.secretsManagerKey,
      reportDetails.storedProcedureName,
    );
    const spreadsheet = new Spreadsheet();
    await spreadsheet.writeDataToSpreadsheet(
      reportDetails.spreadsheetId,
      reportDetails.sheetName,
      reportDetails.range,
      reportData,
    );
  }

  /**
   * @param {number} id
   * @returns {Promise<ReportDetails>}
   */
  async getReportDetails(id) {
    Validate.number(id, 'id');
    return await DBToSheets.#getDataFromDatabase(
      `/db-to-sheets/${stage}/app_user_dts`,
      'dtsf_get_report',
      {id},
    ).then(x => {
      if (x) {
        return new ReportDetails(x);
      }
      return x;
    });
  }

  async getReportData(secretsManagerKey, storedProcedureName) {
    Validate.string(secretsManagerKey, 'secretsManagerKey');
    Validate.string(storedProcedureName, 'storedProcedureName');
    return await DBToSheets.#getDataFromDatabase(
      secretsManagerKey,
      storedProcedureName,
      {},
    );
  }

  /**
   * @param {string} secretsManagerKey
   * @param {string} storedProcedureName
   * @param {{[key:string]: *}}args
   * @returns {Promise<*>}
   */
  static async #getDataFromDatabase(secretsManagerKey,
                                    storedProcedureName,
                                    args) {
    const config = await SecretManager.getSecret(secretsManagerKey);
    const database = new Database(config);
    return await database.process(storedProcedureName, args);
  }
}

module.exports = {DBToSheets};
