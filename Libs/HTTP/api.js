/* eslint-disable func-style */

const fs = require('fs');
const path = require('path');
const http = require('http');
const request = require('request');
// https://github.com/node-modules/urllib
const httpClient = require('urllib');

const logger = console;

const toHump = name => {
  return name.replace(/\_(\w)/g, function (all, letter) {
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

const fail = ({ code = -1, msg, data }) => {
  return {
    code,
    data,
    msg: msg || '',
    success: false,
  };
};

const success = ({ code = 0, status = 200, msg, data = {} }) => {
  return {
    code,
    status,
    data,
    msg: msg || '',
    success: true,
  };
};

const post = (url, data = {}, otherOpts = {}, timeout) => {
  isTestEnv() && console.log(url, data, otherOpts, timeout);
  logger.info(url, data, otherOpts, timeout);

  const opt = {
    dataType: 'json',
    timeout: timeout || 3000,
    method: 'POST',
    contentType: 'json',
    data,
    ...otherOpts,
  };

  return httpClient.request(url, opt);
};

function httpReq(url = '', data = {}, method = 'POST') {
  isTest && console.log(url, data, method);
  logger.info(url, data, method);
  const opt = {};

  if (!isTest) {
    opt.ca = [fs.readFileSync(CURLOPT_CAINFO)];
    opt.cert = fs.readFileSync(CURLOPT_SSLCERT);
    opt.key = fs.readFileSync(CURLOPT_SSLKEY);
    opt.agent = false;
    // 必须加上这个，即不做CURLOPT_SSL_VERIFYPEER\CURLOPT_SSL_VERIFYHOST验证 (验证没通过时不reject)
    opt.rejectUnauthorized = false;
  }

  return httpClient.request(url, {
    method,
    timeout: 3 * 1000,
    contentType: 'json',
    dataType: 'json',
    data,
    ...opt,
  });
}

async function baPost(url, params = {}, extOptions = {}, timeout) {
  const options = {
    auth: `${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}`,
    ...extOptions,
  };

  // const { data: res } = await post(url, params, options, timeout);
  let res = await post(url, params, options, timeout);
  console.log('baPost', res);
  res = res.data;
  if (!res
          || Object.keys(res).length === 0
          || !res.status
          || res.status !== 'success'
  ) {
    const msg = res && res.response && res.response.message ? res.response.message : '调用失败';
    return fail({ msg });
  }

  const data = res.response ? res.response : {};
  return success({ data });
}

async function sslPost(url, params = {}, ignore = false, timeout) {
  const opt = {};

  // 灰度和正式 添加 https双向认证证书
  if (!isTest) {
    opt.ca = [fs.readFileSync(CURLOPT_CAINFO)];
    opt.cert = fs.readFileSync(CURLOPT_SSLCERT);
    opt.key = fs.readFileSync(CURLOPT_SSLKEY);
    opt.agent = false;
    // 必须加上这个，即不做CURLOPT_SSL_VERIFYPEER\CURLOPT_SSL_VERIFYHOST验证 (验证没通过时不reject)
    opt.rejectUnauthorized = false;
  }

  let res = await post(url, params, opt, timeout);
  console.log('sslPost', res);
  res = res.data;

  if(ignore) return {};

  if (!res
          || Object.keys(res).length === 0
          || !res.status
          || res.status !== 'success'
  ) {
    const msg = res && res.response && res.response.message ? res.response.message : '调用失败';
    return fail({ msg });
  }

  const data = res.response ? res.response : {};
  return success({ data });
}

async function atPost(url, params = {}, extOptions = {}, timeout) {
  const options = {
    headers: {
      account: ACCOUNT,
      token: TOKEN,
    },
    ...extOptions,
  };

  let res = await post(url, params, options, timeout);
  console.log('atPost', res);
  res = res.data;
  if (!res
          || Object.keys(res).length === 0
          || !res.status
          || res.status !== 'success'
  ) {
    const msg = res && res.response && res.response.message ? res.response.message : '调用失败';
    return fail({ msg });
  }

  const data = res.response ? res.response : {};
  return success({ data });
}

async function sleep(time = 200) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

module.exports = {
  fail,
  success,
  format,
  toHump,
  isTestEnv,
  getArgs,
  httpReq,
  baPost,
  sslPost,
  atPost,
  sleep,
};
