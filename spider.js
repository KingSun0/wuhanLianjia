const
  {models, sequelize} = require('./models')



async function getInfo (t) {
  await models.house.create({
    区域: '武汉'
  }, {
    transaction: t
  })
}

exports.getInfo = getInfo
