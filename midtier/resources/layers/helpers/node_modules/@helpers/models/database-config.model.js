const {DatabaseEngine} = require('../enums/database-engine.enum');

module.exports.DatabaseConfig = class {
  /**
   * @type {string}
   */
  username;

  /**
   * @type {DatabaseEngine | string}
   */
  engine;

  /**
   * @type {string}
   */
  host;

  /**
   * @type {number}
   */
  port;

  /**
   * @type {string}
   */
  dbname;

  /**
   * @type {string}
   */
  password;

  /**
   * @param {DatabaseConfig} config
   */
  constructor(config) {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }
  }
};
