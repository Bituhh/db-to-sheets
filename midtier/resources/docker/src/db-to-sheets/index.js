const {SecretManager} = require('../secret-manager');
const {Database} = require('../database');
const {Validate} = require('../helpers/validator');

const stage = process.env.stage ?? 'dev';

class DBToSheets {
  /**
   * @param {number} reportId
   * @returns {Promise<void>}
   */
  async run(reportId) {
    // Retrieve Report Info from database
    Validate.number(reportId, 'reportId');
    await this.getReport(reportId);

    // Get DB Connection Data from SSM Parameters.
    // Retrieve Data from DB
    // Map data to a spreadsheet format (Type => (number | string)[][]);
    // Authenticate with Google OAuth.
    // Write data to spreadsheet.
  }

  /**
   * @param {number} id
   * @returns {Promise<void>}
   */
  async getReport(id) {
    Validate.number(id, 'id');
    const config = await SecretManager.getSecret(`/db-to-sheets/${stage}/app_user_dts`);
    const database = new Database(config);
    await database.storedProcedure('dtsf_get_report', {id});
  }
}

module.exports = {DBToSheets};
