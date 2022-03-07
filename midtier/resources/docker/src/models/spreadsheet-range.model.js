class SpreadsheetRange {
  /**
   * @type {string}
   */
  startColumn;

  /**
   * @type {number}
   */
  startRow;

  /**
   * @type {string}
   */
  endColumn;

  /**
   * @type {number}
   */
  endRow;

  /**
   * @param {SpreadsheetRange} range
   */
  constructor(range) {
    for (const key in range) {
      if (range.hasOwnProperty(key)) {
        this[key] = range[key];
      }
    }
  }

  toStringFormat() {
    // Nullish Coalescing Operator was not used here as we need to consider 0 and empty string as false values, so we used the OR(||) operator.
    return `${
      this.startColumn || ''
    }${
      this.startRow || ''
    }:${
      this.endColumn || ''
    }${
      this.endRow || ''
    }`;
  }
}

module.exports = {SpreadsheetRange};
