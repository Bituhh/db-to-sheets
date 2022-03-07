const {SpreadsheetRange} = require('./spreadsheet-range.model');

class ReportDetails {
  /**
   * @type {number}
   */
  id;

  /**
   * @type {string}
   */
  name;

  /**
   * @type {string}
   */
  storedProcedureName;

  /**
   * @type {string}
   */
  secretsManagerKey;

  /**
   * @type {string}
   */
  spreadsheetId;

  /**
   * @type {string}
   */
  sheetName;

  /**
   * @type {SpreadsheetRange}
   */
  range;

  /**
   * @param {ReportDetails} details
   */
  constructor(details) {
    for (const key in details) {
      if (details.hasOwnProperty(key)) {
        if (key === 'range') {
          this[key] = new SpreadsheetRange(details[key]);
        } else {
          this[key] = details[key];
        }
      }
    }
  }
}

module.exports = {ReportDetails};
