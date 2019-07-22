const { sequelize } = require('./models');
const { getXiaoQu } = require('./getXiaoQu');
const moment = require('moment');
const logger = require('./logger');

/**
 * 创建数据库
 */
async function run() {
  await sequelize.sync();
  const before = moment();

  await getXiaoQu();

  const after = moment();
  logger.info('抓取数据总时间: ', after - before);
}

run()
  .catch(err => {
    console.error('Error:', err);
    process.exit();
  })
  .then(() => {
    console.log('爬虫抓取完成');
    process.exit();
  });
