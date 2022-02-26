const {Database} = require('./index');
const {DatabaseEngine} = require('./database-engine.enum');
const stage = process.env.stage ?? 'dev';
const pg = require('pg');
jest.mock('pg');

const {Validate} = require('../helpers/validator');
jest.mock('../helpers/validator');

const {Random} = require('../helpers/random');
const {data} = require('aws-cdk/lib/logging');

const pgClient = pg.Client;

describe('Database', () => {
  beforeEach(() => {
    pgClient.mockReset();
  });

  it('should exist', () => {
    expect(Database).toBeDefined();
  });

  it('should expect connection configuration to be passed', () => {
    expect(() => new Database())
      .toThrow('No database connection configuration was passed!');
    expect(() => new Database(null))
      .toThrow('No database connection configuration was passed!');
    expect(() => new Database(undefined))
      .toThrow('No database connection configuration was passed!');
    expect(() => new Database(''))
      .toThrow('Database connecting configuration is not a object!');
    expect(() => new Database(1))
      .toThrow('Database connecting configuration is not a object!');
  });

  it('should assign configuration to config variable', () => {
    const expected = {engine: 'postgres'};
    const database = new Database(expected);
    expect(database.config).toEqual(expected);
  });

  describe('storedProcedure', () => {
    /**
     * @type {Database}
     */
    let database;
    /**
     * @type {jest.spyOn}
     */
    let callPostgresSpy;
    /**
     * @type {jest.spyOn}
     */
    let callMysqlSpy;

    beforeEach(() => {
      database = new Database({});
      callPostgresSpy = jest.spyOn(database, 'callPostgres')
        .mockImplementation(() => Promise.resolve());
      callMysqlSpy = jest.spyOn(database, 'callMysql')
        .mockImplementation(() => Promise.resolve());
    });

    it('should exist', () => {
      expect(database.storedProcedure).toBeDefined();
    });

    it('should validate first argument as string', async () => {
      database.config.engine = DatabaseEngine.postgres;

      const expected = 'name';
      await database.storedProcedure(expected, {});

      expect(Validate.string).toHaveBeenCalledWith(expected, 'name');
    });

    it('should validate second argument as object', async () => {
      database.config.engine = DatabaseEngine.postgres;

      const expected = {};
      await database.storedProcedure('name', expected);

      expect(Validate.object).toHaveBeenCalledWith(expected, 'args');
    });

    it('should call only Database.callPostgres if connection config.engine is \'postgres\'', async () => {
      database.config.engine = DatabaseEngine.postgres;

      await database.storedProcedure('stored_procedure', {});

      expect(callPostgresSpy).toHaveBeenCalled();
      expect(callMysqlSpy).not.toHaveBeenCalled();
    });

    it('should call Database.callPostgres with the same parameters as stored procedure', async () => {
      database.config.engine = DatabaseEngine.postgres;

      const procedureName = Math.random().toString(36).slice(2);
      const procedureArgs = {reportId: Math.ceil(Math.random() * 10)};
      await database.storedProcedure(procedureName, procedureArgs);

      expect(callPostgresSpy)
        .toHaveBeenCalledWith(procedureName, procedureArgs);
    });

    it('should call only Database.callMysql if connection config.engine is \'mysql\'', async () => {
      database.config.engine = DatabaseEngine.mysql;

      await database.storedProcedure('stored_procedure', {});

      expect(callMysqlSpy).toHaveBeenCalled();
      expect(callPostgresSpy).not.toHaveBeenCalled();
    });

    it('should call Database.callMysql with the same parameters as stored procedure', async () => {
      database.config.engine = DatabaseEngine.mysql;

      const procedureName = Math.random().toString(36).slice(2);
      const procedureArgs = {reportId: Math.ceil(Math.random() * 10)};
      await database.storedProcedure(procedureName, procedureArgs);

      expect(callMysqlSpy).toHaveBeenCalledWith(procedureName, procedureArgs);
    });

    it('should fail if config.engine is unknown and not call any database', () => {
      database.config.engine = 'sql';

      expect(() => database.storedProcedure('stored_procedure', {}))
        .rejects
        .toThrow('Unknown engine in connection configuration!');
      expect(callMysqlSpy).not.toHaveBeenCalled();
      expect(callPostgresSpy).not.toHaveBeenCalled();
    });

    it('should return value from callPostgres', async () => {
      const expected = [{name: 'string'}];
      const spy = jest.spyOn(database, 'callPostgres')
        .mockReturnValue(expected);

      database.config.engine = DatabaseEngine.postgres;
      const result = await database.storedProcedure('stored_procedure', {});

      expect(result).toEqual(expected);
      expect(result).toBe(expected);
    });

    it('should return value from callMysql', async () => {
      const expected = [{name: 'string'}];
      const spy = jest.spyOn(database, 'callMysql')
        .mockReturnValue(expected);

      database.config.engine = DatabaseEngine.mysql;
      const result = await database.storedProcedure('stored_procedure', {});

      expect(result).toEqual(expected);
      expect(result).toBe(expected);
    });
  });

  describe('callPostgres', () => {
    /**
     * @type {Database}
     */
    let database;

    beforeEach(() => {
      database = new Database({});
      database.config = {
        username: expect.any(String),
        engine: DatabaseEngine.postgres,
        host: expect.any(String),
        port: expect.any(Number),
        dbname: expect.any(String),
        password: expect.any(String),
      };
    });

    it('should exist', () => {
      expect(database.callPostgres).toBeDefined();
    });

    it('should validate arguments', async () => {
      const stringSpy = jest.spyOn(Validate, 'string')
        .mockImplementation(() => null);
      const objectSpy = jest.spyOn(Validate, 'object')
        .mockImplementation(() => null);

      const name = 'procedure_name';
      const args = {};
      await database.callPostgres(name, args);

      expect(stringSpy).toHaveBeenCalledWith(name, 'name');
      expect(objectSpy).toHaveBeenCalledWith(args, 'args');
    });

    it('should call new Client()', async () => {
      await database.callPostgres('stored_procedure', {});

      expect(pgClient).toHaveBeenCalled();
    });

    it('should call Client with arguments', async () => {
      await database.callPostgres('stored_procedure', {});

      expect(pgClient).toHaveBeenCalledWith({
        host: database.config.host,
        port: database.config.port,
        user: database.config.username,
        password: database.config.password,
      });
    });

    it('should call client.connect', async () => {
      await database.callPostgres('stored_procedure', {});

      expect(pgClient.prototype.connect).toHaveBeenCalled();
    });

    it('should call client.query', async () => {
      await database.callPostgres('stored_procedure', {});

      expect(pgClient.prototype.query).toHaveBeenCalled();
    });

    it('should call client.query with correct stored procedure', async () => {
      const storedProcedureName = Random.alphanumeric();
      const args = {};
      await database.callPostgres(storedProcedureName, args);

      expect(pgClient.prototype.query)
        .toHaveBeenCalledWith(`SELECT * FROM ${storedProcedureName}()`, []);
    });

    it('should call client.query with name and 2 args', async () => {
      const storedProcedureName = Random.alphanumeric();
      const args = {reportId: 1, reportName: 'report'};
      await database.callPostgres(storedProcedureName, args);

      expect(pgClient.prototype.query)
        .toHaveBeenCalledWith(
          `SELECT * FROM ${storedProcedureName}($1, $2)`,
          [1, 'report'],
        );
    });

    it('should call client.query with name and 1 args', async () => {
      const storedProcedureName = Random.alphanumeric();
      const args = {reportName: Random.alphanumeric()};
      await database.callPostgres(storedProcedureName, args);

      expect(pgClient.prototype.query)
        .toHaveBeenCalledWith(
          `SELECT * FROM ${storedProcedureName}($1)`,
          [args.reportName],
        );
    });

    it('should call client.query with name and 1 args with random key', async () => {
      const storedProcedureName = Random.alphanumeric();
      const args = {[Random.alphanumeric()]: Random.alphanumeric()};
      await database.callPostgres(storedProcedureName, args);

      expect(pgClient.prototype.query)
        .toHaveBeenCalledWith(
          `SELECT * FROM ${storedProcedureName}($1)`,
          [Object.values(args)[0]],
        );
    });

    it('should call client.query with name and random number of args with random key', async () => {
      const storedProcedureName = Random.alphanumeric();
      const args = {};
      for (let i = 0; i < Random.number(100); i++) {
        args[Random.alphanumeric()] = Random.alphanumeric();
      }

      await database.callPostgres(storedProcedureName, args);

      const arrayArgs = Object.values(args);
      const argsString = arrayArgs.reduce((p, c, i) => i === 0
        ? `$${i + 1}`
        : `${p}, $${i + 1}`, null);
      expect(pgClient.prototype.query)
        .toHaveBeenCalledWith(
          `SELECT * FROM ${storedProcedureName}(${argsString})`,
          Object.values(args),
        );
    });

    it('should return result from  client.query', async () => {
      const expected = [
        {id: 1, name: 'Report 1'},
        {id: 1, name: 'Report 1'},
      ];
      pgClient.prototype.query.mockImplementation(() => expected);

      const args = {[Random.alphanumeric()]: Random.alphanumeric()};
      const returned = await database.callPostgres('stored_procedure', args);

      expect(returned).toEqual(expected);
      expect(returned).toBe(expected);
    });
  });
});