const {Random} = require('../helpers/random');
const fs = jest.createMockFromModule('fs');

class MockStream {
  write = jest.fn();
  close = jest.fn();
  end = jest.fn();
}

fs.createWriteStream = jest.fn().mockImplementation((path) => path);
fs.writeFileSync = jest.fn()
  .mockImplementation((path) => path);
fs.rmSync = jest.fn();
fs.promises = {
  readFile: jest.fn().mockReturnValue(Promise.resolve()),
};

module.exports = fs;
