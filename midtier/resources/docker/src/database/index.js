const {DatabaseEngine} = require('../enums/database-engine.enum');
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
  async process(name, args) {
    Validate.string(name, 'name');
    Validate.object(args, 'args');
    switch (this.config.engine) {
      case DatabaseEngine.postgres:
        return await this.postgres(name, args);
      case DatabaseEngine.mysql:
        return await this.mysql(name, args);
      default:
        throw new Error('Unknown engine in connection configuration!');
    }
  }

  async postgres(name, args) {
    Validate.string(name, 'name');
    Validate.object(args, 'args');
    const client = new pg.Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.dbname,
    });
    await client.connect();
    const argsValues = Object.values(args);
    const argsList = argsValues.map((v, i) => `$${i + 1}`).join(', ');
    return await client.query(`SELECT * FROM ${name}(${argsList})`, argsValues)
      .then(data => {
        if (data.rows[0].hasOwnProperty(name)) {
          return data.rows[0][name];
        }
        return data.rows;
      })
      .finally(() => {
        client.end();
      });
  }

  async mysql() {
    // TODO - After completion of initial data.
  }
}

module.exports = {Database};
