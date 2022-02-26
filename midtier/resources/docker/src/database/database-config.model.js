const {DatabaseEngine} = require('./database-engine.enum');

class DatabaseConfig {
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
}

module.exports = {DatabaseConfig};
