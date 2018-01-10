const
  {models, sequelize} = require('./models'),
  {getInfo} = require('./spider')

/**
 * 创建数据库
 */
async function run () {
  await sequelize.sync()
  await sequelize.transaction(async t => await getInfo(t))
  process.exit()

}

run().catch(err => console.error('Error:', err))

