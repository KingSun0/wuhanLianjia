const { models } = require('../models');

async function run() {
  const data = await models.XiaoQu.findAll();
  for (const datum of data) {
    const ljId = datum.url.split('/')[datum.url.split('/').length - 2];

    await models.XiaoQu.update({ ljId }, { where: { id: datum.id } });
  }
}

run()
  .catch(console.error)
  .then(() => process.exit());
