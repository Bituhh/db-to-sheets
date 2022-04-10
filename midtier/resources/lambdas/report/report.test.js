const {Report} = require('./report');

describe('report', () => {
  it('should exist', () => {
    expect(Report).toBeDefined();
  });

  describe('get', () => {
    it('should exist as static', () => {
      expect(Report.get).toBeDefined();
    });
  });

  describe('update', () => {
    it('should exist as static', () => {
      expect(Report.update).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should exist as static', () => {
      expect(Report.delete).toBeDefined();
    });
  });
});
