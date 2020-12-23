

const Redis = require('ioredis');
const fs = require('fs');

const logger = console;

// 本地/测试 redis 配置
const LOCAL_CONFIG = {
  port: 'xxxx', // Redis port
  host: 'xxxx', // Redis host
  password: 'xxxx',
  db: 0,
};

// 缓存数据库连接
const redisMap = {};

function getConfig(redisName) {
  let config;

  config = LOCAL_CONFIG;

  logger.info('[redis cfg]', config);
  return config;
}

function connect(redisName) {
  if (redisMap[redisName]) return redisMap[redisName];

  const config = getConfig(redisName);
  const instance = new Redis(config);

  logger.info('[redis connecting success]');

  redisMap[redisName] = instance;
  return instance;
}

function close(redisName) {
  const redis = redisMap[redisName];
  if (!redis) return false;
  redis && redis.quit();
  delete redisMap[redisName];
  return true;
}

function closeAll() {
  for (const key in redisMap) {
    try {
      close(key);
    } catch (error) {
      logger.error('closeAll error', error);
    }
  }
}

function initEvent() {
  process.on('beforeExit', () => {
    console.log('beforeExit...');
    closeAll();
  });
  process.on('uncaughtException', closeAll);
  process.on('unhandledRejection', closeAll);
}

initEvent();

module.exports = {
  connect,
  closeAll,
};
