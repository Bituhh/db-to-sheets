class Random {
  static alphanumeric() {
    return Math.random().toString(36).slice(2);
  }

  static number(...args) {
    if (args.length === 2) {
      return Math.floor(Math.random() * args[1]) + args[0];
    } else {
      return Math.floor(Math.random() * args[0]);
    }
  }

  static array(size, maxValueInArray = 100) {
    const array = new Array(size);
    for (let i = 0; i < array.length; i++) {
      array[i] = Random.number(maxValueInArray);
    }
    return array;
  }
}

module.exports = {Random};
