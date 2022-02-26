const {DatabaseEngine} = require('./database-engine.enum');
const pg = require('pg');
const {Validate} = require('../helpers/validator');

class Database {

  /**
   * @type {DatabaseConfig}
   */
  config;

  /**
   * @param {DatabaseConfig} configuration
   */
  constructor(configuration) {
    if (configuration === null || configuration === undefined) {
      throw new Error('No database connection configuration was passed!');
    }
    if (typeof configuration !== 'object') {
      throw new Error('Database connecting configuration is not a object!');
    }
    this.config = configuration;
  }

  /**
   * @param {string} name
   * @param {{[key: string]: *}} args
   */
  async storedProcedure(name, args) {
    Validate.string(name, 'name');
    Validate.object(args, 'args');
    switch (this.config.engine) {
      case DatabaseEngine.postgres:
        return await this.callPostgres(name, args);
      case DatabaseEngine.mysql:
        return await this.callMysql(name, args);
      default:
        throw new Error('Unknown engine in connection configuration!');
    }
  }

  async callPostgres(name, args) {
    Validate.string(name, 'name');
    Validate.object(args, 'args');
    const client = new pg.Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
    });
    await client.connect();
    const argsValues = Object.values(args);
    const argsList = argsValues.map((v, i) => `$${i + 1}`).join(', ');
    return await client.query(`SELECT * FROM ${name}(${argsList})`, argsValues);
  }

  async callMysql() {
    // TODO - After completion of initial data.
  }
}

module.exports = {Database};
