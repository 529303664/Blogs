

const crypto = require('crypto');
const { chr, str_repeat } = require('locutus/php/strings');
const { serialize, unserialize } = require('locutus/php/var');
const key = '1RXD5WYw5wrdHR9y';

const md5 = key => {
  console.info('key', key);
  const md5sum = crypto.createHash('md5');
  md5sum.update(key);
  return md5sum.digest('hex');
};
const opensslEncrypt = (data, key) => {
  if (!key || key === undefined || typeof key !== 'string') {
    throw new Error('key 不能为空');
  }
  if (key.length < 32) { // cbc算法 key长度要求32位
    key += str_repeat(chr('\\000'), 32 - key.length);
  }
  data = serialize(data);
  const iv = Buffer.from('fdakinel;injajdji'.slice(0, 16)).toString('base64');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.from(iv, 'base64').toString());
  let encryptedText = cipher.update(data, 'utf8', 'base64');
  encryptedText += cipher.final('base64');
  const params = {
    iv,
    value: encryptedText,
  };
  return Buffer.from(JSON.stringify(params)).toString('base64');
};

const opensslDecrypt = (encrypt, key) => {
  if (!key || key === undefined || typeof key !== 'string') {
    throw new Error('key 不能为空');
  }
  if (key.length < 32) {
    key += str_repeat(chr('\\000'), 32 - key.length);
  }
  encrypt = JSON.parse(Buffer.from(encrypt, 'base64'));
  const iv = Buffer.from(encrypt.iv, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let data = decipher.update(encrypt.value, 'base64', 'utf8');
  data += decipher.final('utf8');
  return unserialize(data);
};

const deepLinkEncrypt = text => {
  let iv = crypto.randomBytes(16);
  iv = iv.toString('base64').slice(0, 16); // aes-128需要16位长度iv
  const algorithm = 'aes-128-cbc';

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedText = cipher.update(text, 'utf8', 'base64');

  encryptedText += cipher.final('base64');
  encryptedText = `${encryptedText}::${iv}`;
  return encodeURIComponent(encryptedText);
};

const deepLinkDecrypt = text => {
  const algorithm = 'aes-128-cbc';
  if (text.indexOf('::') === -1) {
    text = decodeURIComponent(text);
  }
  const [encryptedText, iv] = text.split('::');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const paddingLeft = (key, length) => {
  let pkey = key.toString();
  const l = pkey.length;
  if (l < length) {
    pkey = new Array(length - l + 1).join('0') + pkey;
  } else if (l > length) {
    pkey = pkey.slice(length);
  }
  return pkey;
};

const en = (data, key) => {
  const iv = str_repeat(chr('\\000'), 16);
  const algorithm = 'aes-128-cbc';
  const cryptoKey = Buffer.from(key, 'base64');
  const cipher = crypto.createCipheriv(algorithm, cryptoKey, iv);
  let en = cipher.update(data);
  en = Buffer.concat([en, cipher.final()]);
  const ivBuffer = Buffer.from(iv);
  return Buffer.from(Buffer.concat([ivBuffer, en], ivBuffer.length + en.length)).toString('base64');
};

const de = (data, key) => {
  data = Buffer.from(data, 'base64');
  const algorithm = 'aes-128-cbc';
  const iv = data.slice(0, 16);
  const cryptoKey = Buffer.from(key, 'base64');
  const decipher = crypto.createDecipheriv(algorithm, cryptoKey, iv);
  decipher.setAutoPadding(true);
  let decrypted = decipher.update(data.slice(16));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = {
  md5,
  opensslEncrypt,
  opensslDecrypt,
  deepLinkEncrypt,
  deepLinkDecrypt,
  en,
  de,
};
