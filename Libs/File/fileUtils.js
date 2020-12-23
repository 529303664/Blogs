/* eslint-disable func-style */

const fs = require('fs');
const request = require('request');
// https://github.com/node-modules/urllib
const httpClient = require('urllib');
const byline = require('byline');
const logger = console;

const toHump = name => {
  return name.replace(/\_(\w)/g, function(all, letter) {
    return letter.toUpperCase();
  });
};

/**
 * 环境只有线上和测试之分，执行脚本时通过参数带上 (test / prod)
 * @example
 *  /usr/local/bin/node /data/webapps/test/app.js test
 */
const args = process.argv.slice(2);
const env = args[0] || 'test';

const isTestEnv = () => {
  return env ? env === 'test' : true;
};

const isTest = isTestEnv();

const getArgs = () => {
  // /usr/local/bin/node /data/webapps/test/app.js test
  const args = process.argv.slice(2);
  const env = args[0];
  const stats_day = /^\d{4}(-)(1[0-2]|0?\d)\1([0-2]\d|\d|30|31)$/.test(args[1]) ? args[1] : '';
  return {
    env,
    stats_day,
  };
};

const format = (date, fmt = 'yyyy-MM-dd hh:mm:ss') => {
  const d = date ? new Date(date) : new Date();
  const o = {
    'M+': d.getMonth() + 1, // 月份
    'd+': d.getDate(), // 日
    'h+': d.getHours(), // 小时
    'm+': d.getMinutes(), // 分
    's+': d.getSeconds(), // 秒
    'q+': Math.floor((d.getMonth() + 3) / 3), // 季度
    S: d.getMilliseconds(), // 毫秒
  };

  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${d.getFullYear()}`).substr(4 - RegExp.$1.length));
  // eslint-disable-next-line no-restricted-syntax
  for (const k in o) { if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length))); }
  return fmt;
};

function deleteFile(filepath) {
  fs.existsSync(filepath) && fs.unlinkSync(filepath);
}

/**
 * 根据url下载对应的资源
 * @param {*} url 要下载的资源url
 * @param {*} filepath 下载到本地的绝对路径
 */
function downloadToLocal(url, filepath) {
  logger.info('[downloadToLocal url, filepath]', url, filepath);
  const file = fs.createWriteStream(filepath);
  return new Promise((resolve, reject) => {
    const req = request.get(url); // 支持https http
    req.on('response', response => {
      if (response.statusCode !== 200) {
        return reject('file download fail Response status was ' + response.statusCode);
      }
    });
    req.on('error', e => {
      try {
        deleteFile(filepath);
      } catch (_) {

      }
      reject('file download fail ' + e.message);
    });
    req.pipe(file);
    file.on('finish', () => {
      file.close();
      resolve(true);
    });
    file.on('error', e => {
      try {
        deleteFile(filepath);
      } catch (_) {

      }
      reject('file download fail ' + e.message);
    });
  });
}

/**
 * 远程下载文件，支持断点续传
 * @param {String} url 下载地址
 * @param {String} filepath 文件保存地址
 * @param {Function} progressFun 进度函数 (progress, receivedBytes, totalBytes) => {}
 */
function downloadFileAndResume(url, filepath, progressFun) {
  let receivedBytes = 0;
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    receivedBytes = stats.size;
  }

  if (typeof progressFun !== 'function') {
    progressFun = (progress, receivedBytes, totalBytes) => {};
  }

  // 发送请求，增加一个range头
  const opt = {
    headers: { Range: `bytes=${receivedBytes}-` },
  };

  const file = fs.createWriteStream(filepath, {
    start: receivedBytes,
    flags: receivedBytes > 0 ? 'a+' : 'w',
  });

  return new Promise((resolve, reject) => {
    const req = request.get(url, opt); // 支持https http
    let total = 0;
    console.log(`即将开始下载，URL: ${url}, 文件保存地址：${filepath}, 已下载：${receivedBytes} 字节`);
    if (receivedBytes > 0) {
      console.log(`已存在文件，开始从${receivedBytes + 1}字节处下载`);
    }
    const finish = () => {
      file && file.close();
      resolve({ receivedBytes, total });
    };
    req.on('response', response => {
      total = parseInt(response.headers['content-length'], 10) + receivedBytes;
      if (response.statusCode === 416) {
        return finish();
      } else if (response.statusCode !== 206 && response.statusCode !== 200) {
        return reject('file download fail Response status was ' + response.statusCode);
      }
      response.pipe(file);
    });
    req.on('error', e => {
      try {
        deleteFile(filepath);
      } catch (_) {

      }
      reject('file download fail ' + e.message);
    });
    req.on('data', function(chunk) {
      receivedBytes += chunk.length;
      progressFun(Math.floor(receivedBytes * 100 / total) / 100, receivedBytes, total);
    });
    file.on('finish', finish);
    file.on('error', e => {
      try {
        deleteFile(filepath);
      } catch (_) {

      }
      reject('file download fail ' + e.message);
    });
    process.on('exit', () => {
      console.log('收到进程退出信息, 即将退出');
      file.close();
    });
  });
}

/**
 * 根据本地的资源链接绝对地址进行上传，返回上传的cdn url
 * @param {*} sourcePath 本地的资源链接绝对地址
 */
function upload(sourcePath) {
  logger.info('[upload sourcePath]', sourcePath);
  return new Promise(async (resolve, reject) => {
    const res = await httpClient.request(COMMON_UPLOAD_URL, {
      files: fs.createReadStream(sourcePath),
      method: 'POST',
      timeout: 5 * 60 * 1000,
      dataType: 'json',
    });

    console.log('[daemon util/index upload response', res.data);

    fs.unlink(sourcePath, () => { });

    if (res) {
      resolve(res.data.url);
    } else {
      reject();
    }
  });
}

/**
 * 按行读取 (适用于需要入库的读取场景：这种场景因为数据量大，不能一次性全部读取到内容，也不能全部读取进来就入库，会造成db链接过多报错)
 * @param {*} filepath 要读取的文件本地绝对地址
 * @param {*} NUM_PER_TIME 每次读取的行数
 * @param {*} callback
 */
function readByLine(filepath, callback, NUM_PER_TIME = 400) {
  let i = 0;
  let arr = [];

  return new Promise((resolve, reject) => {
    let str = fs.createReadStream(filepath);
    str.setEncoding('utf8');
    str = byline.createStream(str);

    str.on('data', async function(line) {
      // Pause until we're done processing this line.
      line = line.trim();
      i++;
      if (line) {
        arr.push(line);
      }

      // 上面读取NUM_PER_TIME个，然后暂停读取，一个个插入到db，然后继续读取，反复操作
      if (i === NUM_PER_TIME) { // NUM_PER_TIME
        str.pause();
        await callback(arr);
        i = 0;
        arr = [];
        str.resume();
      }
    });

    str.on('error', e => {
      logger.info('[readByLine error]', e);
      reject(e);
    });

    str.on('end', async function() {
      logger.info('[readByLine end]');
      // 结束时，还会有一定的剩余没有在上面的if逻辑中，余下的在这里插入
      if (callback) {
        await callback(arr);
      }
      resolve(true);
    });
  });
}

/**
 * 按行读取 (适用于需要入库的读取场景：这种场景因为数据量大，不能一次性全部读取到内容，也不能全部读取进来就入库，会造成db链接过多报错)
 * @param {String} url 要读取的文件url地址
 * @param {String} localFilePath 保存到本地的临时文件
 * @param {Number|400} NUM_PER_TIME 每次读取的行数
 * @param {Function} callback 每次读取 ${NUM_PER_TIME} 个，回调一次返回数据
 * @param {Boolean} supportResume 是否开启断点续传
 * @param {Function} progressFun 仅supportResume=true支持, 下载时的进度函数 (progress, receivedBytes, totalBytes) => {}
 */
function readByLineFromUrl(url, localFilePath, callback, NUM_PER_TIME = 400, supportResume = false, progressFun) {
  return new Promise(async (resolve, reject) => {
    if (supportResume) {
      await downloadFileAndResume(url, localFilePath, progressFun);
    } else {
      await downloadToLocal(url, localFilePath);
    }
    await readByLine(localFilePath, callback, NUM_PER_TIME);
    resolve(true);
  });
}

// fn 尽量用 async定义
async function protect(fn) {
  logger.info(`[execute function ${fn.name}] start...pid: ${process.pid}`);
  await fn();
  logger.info(`[execute function ${fn.name}] finished`);
}

// 获取前一天时间
function getPreDate() {
  const curDate = new Date();
  return new Date(curDate.getTime() - 24 * 60 * 60 * 1000);
}

module.exports = {
  format,
  toHump,
  isTestEnv,
  getArgs,
  deleteFile,
  downloadToLocal,
  downloadFileAndResume,
  upload,
  readByLine,
  readByLineFromUrl,
  protect,
  getPreDate,
};
