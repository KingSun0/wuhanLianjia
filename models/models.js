/* eslint-disable */

const
    Sequelize = require('sequelize')

module.exports = (sequelize)=>{

  const house = sequelize.define("house", {
    id: {type: Sequelize.STRING , primaryKey: true, defaultValue: Sequelize.UUIDV1}, // 唯一ID，
    描述: {type: Sequelize.STRING},
    区: {type: Sequelize.STRING ,}, // ，
    街道: {type: Sequelize.STRING ,}, // ，
    小区名: {type: Sequelize.STRING ,}, // ，
    单价: {type: Sequelize.INTEGER ,}, // ，
    总价: {type: Sequelize.INTEGER ,}, // ，
    首付: {type: Sequelize.INTEGER ,}, // ，
    月供: {type: Sequelize.INTEGER ,}, // ，
    税费: {type: Sequelize.INTEGER ,}, // ，
    房型: {type: Sequelize.STRING ,}, // ，
    面积: {type: Sequelize.INTEGER ,}, // ，
    房屋年限: {type: Sequelize.STRING ,}, // ，
    所在楼层: {type: Sequelize.STRING ,}, // ，
    装修: {type: Sequelize.STRING ,}, // ，
    电梯: {type: Sequelize.STRING ,}, // ，
    发布日期: {type: Sequelize.STRING ,}, // ，
    链接地址: {type: Sequelize.STRING ,}, // ，
    小区开盘时间: {type: Sequelize.STRING ,}, // ，
    小区当前平均价: {type: Sequelize.INTEGER ,}, // ，
    小区上次成交时间: {type: Sequelize.STRING ,}, // ，
    小区上次成交价格: {type: Sequelize.INTEGER ,}, // ，
    小学: {type: Sequelize.STRING ,}, // ，
    中学: {type: Sequelize.STRING ,}, // ，
    高中: {type: Sequelize.STRING ,}, // ，
    医院: {type: Sequelize.STRING ,}, // ，
    购物广场: {type: Sequelize.STRING ,}, // ，
    地铁: {type: Sequelize.STRING ,}, // ，
    公交: {type: Sequelize.STRING ,}, // ，
    房源总数: {type: Sequelize.INTEGER ,}, // ，
    抓取日期: {type: Sequelize.STRING ,}, // ，
  },{
    freezeTableName: true,
    indexes:[
      
    ],
    description: '房子'
  });
};
