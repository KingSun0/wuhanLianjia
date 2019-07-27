const puppeteer = require('puppeteer-core');
const moment = require('moment');
const { models, sequelize } = require('../models');
const logger = require('../logger');

let totalXiaoQuW = null;

const regions = ['wuchang', 'donghugaoxin', 'hanyang', 'jianghan', 'jiangan'];

exports.getXiaoQu = async query => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ignoreHTTPSErrors: true,
    // headless: false,
  });

  if (query) {
    const url = `https://wh.lianjia.com/xiaoqu/${query.region}/pg${query.page}/`;
    await insertXiaoQu(browser, url);
    logger.info(`${query.region} 区域的第 ${query.page} 页数据抓取完成`);
  } else {
    for (const region of regions) {
      let i = 1;
      while (true) {
        await sleep(10000);
        const url = `https://wh.lianjia.com/xiaoqu/${region}/pg${i}/`;
        let data = [];
        try {
          data = await insertXiaoQu(browser, url);
        } catch (e) {
          logger.error(`${region} 区域的第 ${i} 页数据出现错误`);
          logger.error(e);
          i++;
          continue;
        }
        if (!data.length) {
          logger.info(`${region} 区域的第 ${i} 页没有数据，停止抓取`);
          break;
        }
        if (i > 80) {
          logger.info(`${region} 区域超过 80 页，停止抓取`);
          break;
        }

        logger.info(`${region} 区域的第 ${i} 页数据抓取完成`);

        i++;
      }
    }
  }

  await browser.close();
  logger.info('删除重复数据完成');
  logger.info('close browser');

  // 删除重复数据
  // await sequelize.query(`
  //   DELETE FROM XiaoQu
  //     WHERE id IN (
  //       SELECT * FROM (
  //         SELECT X2.id
  //         FROM XiaoQu X1
  //         LEFT JOIN XiaoQu X2
  //         ON X1.id < X2.id AND X1.ljId = X2.ljId AND X1.selectTime = X2.selectTime
  //       ) X3
  //   )
  // `);

  logger.info('查询小区数据完成');
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
    logger.info(`${moment().format('YYYY-MM-DD HH:mm')} 总共查询 ${totalXiaoQu} 个小区`);
    totalXiaoQuW = totalXiaoQu;
  }

  data.forEach(datum => (datum.selectTime = moment().format('YYYY-MM-DD')));

  await models.XiaoQu.bulkCreate(data);

  await page.close();
  logger.info('close page');

  return data;
}

async function sleep(time) {
  logger.info(`暂停 ${time / 1000} 秒`);
  return new Promise(resolve => setTimeout(resolve, time));
}
