class Validate {

  /**
   * @type {(arg: string, name: string) => void}
   */
  static string = (...args) => {
    Validate.#arguments(args, 2);
    Validate.#type(args[0], 'string', args[1]);
  };

  /**
   * @type {(arg: {}, name: string) => void}
   */
  static object = (...args) => {
    Validate.#arguments(args, 2);
    Validate.#type(args[0], 'object', args[1]);
  };

  static number = (...args) => {
    Validate.#arguments(args, 2);
    Validate.#type(args[0], 'number', args[1]);
  };

  /**
   * @param {*[]} args
   * @param {number} expected
   */
  static #arguments(args, expected) {
    if (args.length !== expected) {
      throw new SyntaxError(`Expected ${expected} arguments but received ${args.length} arguments!`);
    }
  }

  static #type(value, type, name) {
    if (typeof value !== type || value === null) {
      throw new Error(`Argument '${name}' is not a ${type}!\nInstead received ${typeof value} as ${JSON.stringify(value)}.`);
    }
  }
}

module.exports = {Validate};
