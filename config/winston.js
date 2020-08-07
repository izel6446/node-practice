// import winston from 'winston';
const winston = require('winston');
// import winstonDaily from 'winston-daily-rotate-file';
const winstonDaily = require('winston-daily-rotate-file');

const logDir = 'logs';  // logs 디렉토리 하위에 로그 파일 저장
const { combine, timestamp, printf } = winston.format;


// Define log format
const logFormat = printf(info => {
  const padding= info.level.length <= 7?7:17;  //padding)
  return `${info.timestamp} | ${info.level.toUpperCase().padEnd(padding,' ')} | ${info.message}`;
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
let logger = winston.createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
  ),
  transports: [
    // info 레벨 로그를 저장할 파일 설정
    new winstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30,  // 30일치 로그 파일 저장
      zippedArchive: true, 
    }),
    new winstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: `%DATE%-debug.log`,
      maxFiles: 10,
      zippedArchive: true, 
    }),
  ],
});

// Production 환경이 아닌 경우(dev 등) 
console.log(`process.env.NODE_ENV : ${process.env.NODE_ENV}`)
if (process.env.NODE_ENV !== 'production') {
    logger = winston.createLogger({
      format: combine(
        winston.format.splat(),
        winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
        winston.format.printf(info =>{
            const padding= info.level.length <= 7?7:17;  //padding
            return winston.format.colorize().colorize(info.level, `${info.timestamp} | ${info.level.toUpperCase().padEnd(padding,' ')} | ${info.message}`)
          }
        )
      ),
      transports: [
        new (winston.transports.Console)({
            level: 'debug',
            stderrLevels: ['warn', 'error', 'alert'],
            handleExceptions: true,
            humanReadableUnhandledException: true
          })
      ]
    });
  };

module.exports = logger;