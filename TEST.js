const moment = require('moment');

const m1 = moment();
const m2 = moment(m1).add(10, 'seconds');

console.log('diff: ', m2 - m1);
