const puppeteer = require('puppeteer-core');
const moment = require('moment');
const { models, sequelize } = require('./models');
const logger = require('./logger');

let totalXiaoQuW = null;

const regions = ['wuchang', 'donghugaoxin', 'hanyang', 'jianghan', 'jiangan'];

exports.getXiaoQu = async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ignoreHTTPSErrors: true,
    // headless: false,
  });

  for (const region of regions) {
    for (let i = 1; i <= 20; i++) {
      await sleep(10000);
      const url = `https://wh.lianjia.com/xiaoqu/${region}/pg${i}/`;
      await insertXiaoQu(browser, url);
    }
  }
  await browser.close();

  // 删除重复数据
  await sequelize.query(`
    DELETE FROM XiaoQu
      WHERE id IN (
        SELECT * FROM (
          SELECT X2.id
          FROM XiaoQu X1
          LEFT JOIN XiaoQu X2
          ON X1.id < X2.id AND X1.ljId = X2.ljId AND X1.selectTime = X2.selectTime
        ) X3
    )
`);
};

async function insertXiaoQu(browser, url) {
  const page = await browser.newPage();
  await page.goto(url, {
    timeout: 0,
    waitUntil: ['domcontentloaded'],
  });
  const { totalXiaoQu, data } = await page.evaluate(() => {
    // 总的小区数量
    const totalXiaoQu = document.querySelector('.total.fl span').innerText.trim();

    const xiaoQuList = document.querySelectorAll('.listContent li');
    const data = [];

    for (let i = 0; i < xiaoQuList.length; i++) {
      const item = {};
      const xiaoQu = xiaoQuList[i];

      item.name = xiaoQu.querySelector('.title a').innerText.trim();
      item.url = xiaoQu.querySelector('.title a').href;
      item.ljId = item.url.split('/')[item.url.split('/').length - 2];

      const positions = xiaoQu.querySelectorAll('.positionInfo a');
      item.tags = [];
      for (let j = 0; j < positions.length; j++) {
        const position = positions[j];
        item.tags.push(position.innerText.trim());
      }
      item.district = item.tags[0];

      item.price = parseInt(xiaoQu.querySelector('.totalPrice span').innerText);
      item.toSellHouse = parseInt(
        xiaoQu.querySelector('.xiaoquListItemSellCount a span').innerText,
      );

      data.push(item);
    }

    return { totalXiaoQu, data };
  });

  if (!totalXiaoQuW) {
    logger.info(`${moment().format('YYYY-MM-DD HH:mm')}总共查询 ${totalXiaoQu} 个小区`);
    totalXiaoQuW = totalXiaoQu;
  }

  data.forEach(datum => (datum.selectTime = moment().format('YYYY-MM-DD')));

  await models.XiaoQu.bulkCreate(data);

  await page.close();
}

async function sleep(time) {
  logger.info(`暂停 ${time / 1000} 秒`);
  return new Promise(resolve => setTimeout(resolve, time));
}
