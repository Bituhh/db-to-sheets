const CaseType = {
  upper: 0,
  lower: 0,
  mixed: 0,
};

class Random {
  /**
   * @param {number} length
   * @returns {string}
   */
  static alphanumeric(length = 16) {
    let string = '';
    for (let i = 0; i < length; i++) {
      if (Math.random() > 0.5) {
        string += Random.character(CaseType.mixed);
      } else {
        string += `${Random.number(10)}`;
      }
    }
    return string;
  }

  /**
   * @param {number} max
   * @returns {number}
   */
  static number(max) {
    return Math.floor(Math.random() * max);
  }

  /**
   * @param {CaseType} caseType
   * @returns {string}
   */
  static character(caseType = CaseType.lower) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    switch (caseType) {
      case CaseType.mixed:
        if (Math.random() > 0.5) {
          return characters[Random.number(characters.length)].toUpperCase();
        } else {
          return characters[Random.number(characters.length)];
        }
      case CaseType.upper:
        return characters[Random.number(characters.length)].toUpperCase();
      case CaseType.lower:
      default:
        return characters[Random.number(characters.length)];
    }
  }

  /**
   * @param {number} length
   * @param {CaseType} caseType
   */
  static string(length = 16, caseType = CaseType.mixed) {
    let string = '';
    for (let i = 0; i < length; i++) {
      string += Random.character(caseType);
    }
    return string;
  }

  /**
   * @param {number} size
   * @param {number} maxValueInArray
   * @returns {number[]}
   */
  static array(size, maxValueInArray = 100) {
    const array = new Array(size);
    for (let i = 0; i < array.length; i++) {
      array[i] = Random.number(maxValueInArray);
    }
    return array;
  }

  static #columns(length) {
    const obj = {};
    for (let i = 0; i < length; i++) {
      obj[Random.alphanumeric()] = Random.alphanumeric();
    }
    return obj;
  };

  /**
   * @param maxColumnLength
   * @param maxRowLength
   * @returns {{[key: string]: *}[]}
   */
  static table(maxColumnLength = 100, maxRowLength = 1000) {
    const columnsLength = Random.number(maxColumnLength) + 1;
    const rowLength = Random.number(maxRowLength) + 1;
    const array = [];
    for (let i = 0; i < rowLength; i++) {
      array.push(Random.#columns(columnsLength));
    }
    return array;
  };

  static object(maxSize = 10) {
    const size = Random.number(maxSize);
    const obj = {};
    for (let i = 0; i < size; i++) {
      obj[Random.alphanumeric()] = Random.alphanumeric();
    }
    return obj;
  }
}

module.exports = {Random, CaseType};
