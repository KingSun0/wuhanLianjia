const winston = require('winston');
const { createLogger, format } = winston;
const { combine, timestamp, printf } = format;
const moment = require('moment');

const myFormat = printf(({ level, message, timestamp }) => {
  return `${moment(timestamp).format('YYYY-MM-DD HH:mm:ss')} ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), myFormat),
  defaultMeta: { service: 'user-service' },
  transports: [new winston.transports.File({ filename: 'logs/combined.log' })],
});

module.exports = logger;
