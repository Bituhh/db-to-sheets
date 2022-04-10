class Validate {

  /**
   * @type {(arg: string, name: string) => void}
   */
  static string = (arg, name) => {
    Validate.arguments([arg, name], 2);
    Validate.type(arg, 'string', name);
  };

  /**
   * @type {(arg: {}, name: string) => void}
   */
  static object = (arg, name) => {
    Validate.arguments([arg, name], 2);
    Validate.type(arg, 'object', name);
  };

  static number(arg, name) {
    Validate.arguments([arg, name], 2);
    Validate.type(arg, 'number', name);
  };

  /**
   * @param {*[]} args
   * @param {number} expected
   */
  static arguments(args, expected) {
    if (args.length !== expected) {
      throw new SyntaxError(`Expected ${expected} arguments but received ${args.length} arguments!`);
    }
  }

  static type(value, type, name) {
    if (typeof value !== type || value === null) {
      throw new Error(`Argument '${name}' is not a ${type}!\nInstead received ${typeof value} as ${JSON.stringify(value)}.`);
    }
  }
}

module.exports = {Validate};
