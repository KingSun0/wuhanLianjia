module.exports = {
  mysql: {
    database: 'WuHanLianJia',
    username: 'root',
    password: 'root',
    options: {
      host: '127.0.0.1',
      port: '3306',
      dialect: 'mysql'
    }
  },
  cache: false,
  port: 5100,
  cluster: false,
  basis: {},
  uploadPath: `${process.cwd()}/uploadFile`
}
