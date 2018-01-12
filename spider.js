const
  {models, sequelize, Sequelize} = require('./models'),
  request = require('request-promise'),
  cheerio = require('cheerio'),
  moment = require('moment'),
  uuidv1 = require('uuid/v1')

async function insertHouses (t) {
  let 抓取日期 = moment().format('YYYY-MM-DD')

  await models.house.destroy({
    transaction: t,
    where: {抓取日期},
  })

  await createAllHouse(t)
}
exports.insertHouses = insertHouses

/**
 * 获取所有房子数据
 * 1. 获取所有目录页的 url
 * 2. 获取所有房子的 url
 * 3. 获取所有房子的信息
 *
 * check 重复性
 * 1. 描述相同且小区相同的数据剔除
 *
 * @param t
 * @return {Promise<Array>}
 */

async function createAllHouse (t) {

  let html = await request('https://wh.lianjia.com/ershoufang/pg1/')
  let
    $ = cheerio.load(html),
    抓取日期 = moment().format('YYYY-MM-DD'),
    房源总数 = parseInt($('.total span').text())

  let
    houses = [],
    promiseAll = [],
    startNum = 1,
    addNum = 10,
    maxNum = 300,
    insertAll = []

  while (startNum < maxNum) {
    let houseUrls = await getAllHouseUrl(startNum, startNum + addNum)

    console.time('house 获取时间')
    let houseHtmls = await Promise.all(houseUrls.map(houseUrl => new Promise((resolve, reject) => {
      request(houseUrl).then(houseHtml => {
        resolve(houseHtml)
      })
    })))

    console.timeEnd('house 获取时间')

    for (let houseHtml of houseHtmls) {
      let house = {
        id: uuidv1(),
        ...getHouseInfo(houseHtml),
        抓取日期,
        房源总数
      }

      let sameHouses = houses.filter(item => {
        if (item.描述 === house.描述) return true
        return false
      })

      if (sameHouses.length === 0) {
        houses.push(house)
      }
    }
    startNum += addNum

    console.log('获取完当前阶段 house')
  }

  console.time('插入 house 时间')
  await models.house.bulkCreate(houses, {transaction: t})
  console.timeEnd('插入 house 时间')

  let count = await models.house.count({
    transaction: t,
    where: {抓取日期}
  })

  console.log(`本次录入 ${count} 条房屋数据`)
}

/**
 * 1. 生成所有目录的 url
 * 2. 获取所有房子的 url
 * 3. 如果有重复则剔除
 *
 * @return {Promise<void>}
 */

async function getAllHouseUrl (start, end) {
  let
    baseUrl = 'https://wh.lianjia.com/ershoufang/pg',
    listUrls = [],
    houseUrls = []


  for (let i = start; i < end; i++) {
    listUrls.push(`${baseUrl}${i}/`)
  }

  console.time('List Url 获取时间')
  let listHtmls = await Promise.all(listUrls.map(listUrl => new Promise((resolve, reject) => {
    request(listUrl).then(html => resolve(html))
  })))

  console.timeEnd('List Url 获取时间')

  console.log('获取完当前阶段 List URL')

  for (let listHtml of listHtmls) {
    let $ = cheerio.load(listHtml)

    let $urls = $('.title a', '.sellListContent .clear')

    $urls.each(function (i, item) {
      houseUrls.push($(this).attr('href'))
    })
  }

  console.log('house 数量：', houseUrls.length)
  return houseUrls
}


/**
 *
 * 解析 房子 html 中的数据
 */

function getHouseInfo (houseHtml) {
  let $house = cheerio.load(houseHtml)

  $house('.introContent .base li span').remove()
  $house('.transaction .content li span').remove()

  let
    basicAttrs = $house('.introContent .base li'),
    transactionAttrs = $house('.transaction .content li')

  let house = {
    描述: `${$house('.content .main', '.sellDetailHeader').text()}，${$house('.content .sub', '.sellDetailHeader').text()}`,
    区: $house('.areaName .info').children().first().text(),
    街道: $house('.areaName .info').children().last().text(),

    单价: parseInt($house('.unitPriceValue').text()),
    总价: parseInt($house('.price .total').text()),
    首付: parseInt($house('.taxtext span').first().text().replace(/[^0-9]/ig, '')),
    税费: null,

    房型: basicAttrs.eq(0).text(),
    所在楼层: basicAttrs.eq(1).text(),
    面积: parseInt(basicAttrs.eq(2).text()),
    装修: basicAttrs.eq(8).text(),
    电梯: basicAttrs.eq(10).text(),

    发布日期: transactionAttrs.eq(0).text(),
    房屋年限: transactionAttrs.eq(4).text(),
    链接地址: $house('head link').attr('href'),

    小区名: $house('.communityName .label').next().text(),

    地铁: $house('.areaName .supplement').text(),
  }

  return house
}

function getHouseArr (houses, num) {
  let result = [];

  for (let i = 0, len = houses.length; i < len; i += num) {
    result.push(houses.slice(i, i + num));
  }
  return result
}

