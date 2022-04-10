const {DBToSheets} = require('./db-to-sheets');

process.env.REPORT_ID = '1';

const dbToSheets = new DBToSheets();
dbToSheets.run(+process.env.REPORT_ID).then(x => {
  console.log(x);
}).catch(err => {
  console.error(err);
});
