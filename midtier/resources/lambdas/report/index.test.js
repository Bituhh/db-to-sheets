const {handler} = require('./index');
const {Report} = require('./report');
jest.mock('./report');

describe('index', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should exist', () => {
    expect(handler).toBeDefined();
  });

  it('should call Report.get if httpMethod is "GET" only', () => {
    handler({httpMethod: 'GET'});

    expect(Report.get).toHaveBeenCalled();
    expect(Report.update).not.toHaveBeenCalled();
    expect(Report.delete).not.toHaveBeenCalled();
  });

  it('should call Report.update if httpMethod is "PUT" only', () => {
    handler({httpMethod: 'PUT'});

    expect(Report.update).toHaveBeenCalled();
    expect(Report.get).not.toHaveBeenCalled();
    expect(Report.delete).not.toHaveBeenCalled();
  });

  it('should call Report.delete if httpMethod is "DELETE" only', () => {
    handler({httpMethod: 'DELETE'});

    expect(Report.delete).toHaveBeenCalled();
    expect(Report.get).not.toHaveBeenCalled();
    expect(Report.update).not.toHaveBeenCalled();
  });

  it('should call Report.delete if httpMethod is "DELETE" only', () => {
    handler({httpMethod: Math.random().toString(36).slice(2)});

    expect(Report.delete).toHaveBeenCalled();
    expect(Report.get).not.toHaveBeenCalled();
    expect(Report.update).not.toHaveBeenCalled();
  });
});
