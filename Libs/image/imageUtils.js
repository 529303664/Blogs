const URL = require('url');
const http = require('http');
const sizeOf = require('image-size');

/**
 * 获取图片信息
 * @param {String} url 图片链接或本地文件路径
 */
export async function getimagesizeInNode(url) {
  let dimensions;
  if (/^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(url)) {
    const options = URL.parse(url);
    dimensions = await new Promise(resolve => {
      http.get(options, function(response) {
        const chunks = [];
        response.on('data', function(chunk) {
          chunks.push(chunk);
        }).on('end', function() {
          const buffer = Buffer.concat(chunks);
          resolve(sizeOf(buffer));
        });
      });
    });
  } else {
    dimensions = sizeOf(url);
  }
  return { width: dimensions.width, height: dimensions.height, type: dimensions.type, orientation: dimensions.orientation };
}

/**
 * 获取远程图片信息
 * @param {String} url 远程图片地址
 */
export function imageInfoInBrowser(url) {
  return new Promise(resolve => {
    const info = { w: 0, h: 0, base64: '' };

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      const canvas = document.createElement('CANVAS');
      const ctx = canvas.getContext('2d');
      let dataURL;
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL('image/jpeg');

      info.w = this.naturalWidth;
      info.h = this.naturalHeight;
      info.base64 = dataURL;

      resolve(info);
    };

    img.src = url;

  });
}
