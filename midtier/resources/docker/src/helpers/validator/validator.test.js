const {Validate} = require('./index');
const {Random} = require('../random');

describe('Validator', () => {
  it('should exist', () => {
    expect(Validate).toBeDefined();
  });

  describe('string', () => {
    it('should exist as static', () => {
      expect(Validate.string).toBeDefined();
    });

    it('should expect 2 arguments', () => {
      let randomNumber;
      do {
        randomNumber = Random.number(10);
      } while (randomNumber === 2);
      const args = Random.array(randomNumber);

      expect(() => Validate.string(...args))
        .toThrow(new SyntaxError(`Expected 2 arguments but received ${args.length} arguments!`));
    });

    it('should have first argument to be string and custom error message', () => {
      const args = [true, false, 0, 1, null, undefined, {}];
      for (const arg of args) {
        const name = Random.alphanumeric();
        expect(() => Validate.string(arg, name))
          .toThrow(new Error(`Argument '${name}' is not a string!`));
      }

      name = Random.alphanumeric();
      expect(() => Validate.string('', name))
        .not
        .toThrow(new Error(`Argument '${name}' is not a string!`));
    });
  });

  describe('object', () => {
    it('should exist as static', () => {
      expect(Validate.object).toBeDefined();
    });

    it('should expect 2 arguments only', () => {
      let randomNumber;
      do {
        randomNumber = Random.number(10);
      } while (randomNumber === 2);
      const args = Random.array(randomNumber);

      expect(() => Validate.object(...args))
        .toThrow(new SyntaxError(`Expected 2 arguments but received ${args.length} arguments!`));
    });

    it('should have first argument to be object and custom error message', () => {
      const args = [true, false, 0, 1, '', 'string', null, undefined];
      for (const arg of args) {
        const name = Random.alphanumeric();
        expect(() => Validate.object(arg, name))
          .toThrow(new Error(`Argument '${name}' is not a object!`));
      }

      const name = Random.alphanumeric();
      expect(() => Validate.object({}, name))
        .not
        .toThrow(new Error(`Argument '${name}' is not a object!`));
    });
  });

  describe('number', () => {
    it('should exist as static', () => {
      expect(Validate.number).toBeDefined();
    });

    it('should expect 2 arguments only', () => {
      let randomNumber;
      do {
        randomNumber = Random.number(10);
      } while (randomNumber === 2);
      const args = Random.array(randomNumber);

      expect(() => Validate.number(...args))
        .toThrow(new SyntaxError(`Expected 2 arguments but received ${args.length} arguments!`));
    });

    it('should have first argument to be number and custom error message', () => {
      const args = [true, false, {}, '', 'string', null, undefined];
      for (const arg of args) {
        const name = Random.alphanumeric();
        expect(() => Validate.number(arg, name))
          .toThrow(new Error(`Argument '${name}' is not a number!`));
      }

      const name = Random.alphanumeric();
      expect(() => Validate.number(Random.number(100000), name))
        .not
        .toThrow(new Error(`Argument '${name}' is not a number!`));
    });
  });
});
