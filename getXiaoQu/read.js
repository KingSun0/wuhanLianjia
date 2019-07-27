const fs = require('fs');

const data = fs.readFileSync(
  '/Users/gaochengyi/Documents/home/买房/WuHanLianJia/getXiaoQu/tempData.json',
);

console.log('data: ', JSON.parse(data));
