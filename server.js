const { sequelize } = require('./models');
const { getXiaoQu } = require('./getXiaoQu');
const moment = require('moment');
const logger = require('./logger');

logger.info();
logger.info();
logger.info();
logger.info();
logger.info();
logger.info();
logger.info();
logger.info();
logger.info();
logger.info();
logger.info();
logger.info('开始抓取爬虫');

/**
 * 创建数据库
 */
async function run() {
  await sequelize.sync();
  const before = moment();

  await getXiaoQu();

  const after = moment();
  logger.info(`抓取数据总时间: ${after - before}`);
}

run()
  .catch(err => {
    logger.info(`Error: ${err}`);
    process.exit();
  })
  .then(() => {
    logger.info('爬虫抓取完成');
    process.exit();
  });
