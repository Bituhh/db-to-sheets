const {Report} = require('./report');

module.exports.handler = async (event) => {
  switch (event.httpMethod) {
    case 'GET':
      return Report.get();
    case 'PUT':
      return Report.update();
    case 'DELETE':
      return Report.delete();
  }
};
