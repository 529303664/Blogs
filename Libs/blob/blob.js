'use strict';

export function createBlobByStringList (stringList, type = 'text/plain') {
  return new Blob([...stringList], { type });
}

/**
 * 
 * @param {*} typedArray 一个类型化数组（TypedArray）对象描述了一个底层的二进制数据缓冲区（binary data buffer）的一个类数组视图（view） etc.
 * @param {*} type 
 */
export function createBlobByBuffer (typedArray, type = 'text/plain') {
  return new Blob([new Uint8Array(typedArray)], { type });
}

/**
 * 
 * @param {Array} htmlArray 包含HTML的数组
 * @param {*} type 
 * @param {*} endings 
 */
export function createBlobByHtml (htmlArray, type = 'text/html', endings = 'transparent') {
  return new Blob(htmlArray, { type, endings });
}

/**
 * 批量分块上传
 * @param {string} url 上传地址
 * @param {File} file File对象或者Blob对象
 * @param {Number} chunkSize 分块大小
 */
export async function chunkedUpload (url, file, chunkSize = 40000) {
  for (let start = 0; start < file.size; start += chunkSize) {
    const chunk = file.slice(start, start + chunkSize + 1);
    const fd = new FormData();
    fd.append('data', chunk);
    await fetch(url, { method: 'post', body: fd }).then((res) => res.text());
  }
}

/**
 * 下载并返回blob数据
 * @param {string} url 下载地址
 * @param {Function} callback 返回blob类型下载数据 (blob) => {}
 */
export function downloadToBlobByXhr (url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.onload = () => { callback(xhr.response); };
  xhr.send(null);
};

/**
 * 下载并返回blob数据
 * @param {string} url 下载地址
 * @param {Function} callback 返回blob类型下载数据 (blob) => {}
 */
export function downloadToBlobByFetch (url, callback) {
  const myRequest = new Request(url);
  fetch(myRequest)
    .then(function (response) {
      return response.blob();
    })
    .then(function (myBlob) {
      callback(myBlob);
    });
};


const MAX_WIDTH = 800; // 图片最大宽度
export function compress (base64, quality, mimeType) {
  let canvas = document.createElement('canvas');
  let img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  return new Promise((resolve, reject) => {
    img.src = base64;
    img.onload = () => {
      let targetWidth, targetHeight;
      if (img.width > MAX_WIDTH) {
        targetWidth = MAX_WIDTH;
        targetHeight = (img.height * MAX_WIDTH) / img.width;
      } else {
        targetWidth = img.width;
        targetHeight = img.height;
      }
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      let ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, targetWidth, targetHeight); // 清除画布 
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let imageData = canvas.toDataURL(mimeType, quality / 100);
      resolve(imageData);
    };
  });
}

export function dataUrlToBlob (base64, mimeType) {
  let bytes = window.atob(base64.split(',')[1]);
  let ab = new ArrayBuffer(bytes.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }
  return new Blob([ia], { type: mimeType });
}

export function uploadFile (url, blob) {
  let formData = new FormData();
  let request = new XMLHttpRequest();
  formData.append('image', blob);
  request.open('POST', url, true);
  request.send(formData);
}

/**
 * loadFile from input event
 * @param {*} event 
 */
export const loadFile = function (event) {
  const reader = new FileReader();
  reader.onload = async function () {
    let compressedDataURL = await compress(
      reader.result,
      90,
      'image/jpeg'
    );
    let compressedImageBlob = dataUrlToBlob(compressedDataURL);
    uploadFile('https://httpbin.org/post', compressedImageBlob);
  };
  reader.readAsDataURL(event.target.files[0]);
};

