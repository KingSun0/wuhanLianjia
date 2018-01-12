const
  {models, sequelize} = require('./models'),
  {insertHouses} = require('./spider')

/**
 * 创建数据库
 */
async function run () {
  await sequelize.sync()

  console.time('抓取数据总时间')
  await sequelize.transaction(async t => await insertHouses(t))
  console.timeEnd('抓取数据总时间')
  process.exit()

}

run().catch(err => console.error('Error:', err))

