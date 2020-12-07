'use strict';

// 示例一：从字符串创建 Blob
(() => {
  let myBlobParts = ['<html><h2>Hello Semlinker</h2></html>']; // an array consisting of a single DOMString
  let myBlob = new Blob(myBlobParts, {type : 'text/html', endings: 'transparent'}); // the blob

  console.log(myBlob.size + ' bytes size');
  // Output: 37 bytes size
  console.log(myBlob.type + ' is the type');
})();
// Output: text/html is the type

// 示例二：从类型化数组和字符串创建 Blob
(() => {
  let hello = new Uint8Array([72, 101, 108, 108, 111]); // 二进制格式的 "hello"
  let blob = new Blob([hello, ' ', 'lucas'], { type: 'text/plain' });
})();

// 分片上传
(async () => {
  const file = new File(['a'.repeat(1000000)], 'test.txt');

  const chunkSize = 40000;
  const url = 'https://httpbin.org/post';

  async function chunkedUpload() {
    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize + 1);
      const fd = new FormData();
      fd.append('data', chunk);

      await fetch(url, { method: 'post', body: fd }).then((res) =>
        res.text()
      );
    }
  }

  await chunkedUpload();
})();

// 从互联网下载数据
(() => {
  const downloadBlob = (url, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      callback(xhr.response);
    };
    xhr.send(null);
  };
})();

// 使用 fetch API 来实现以流的方式获取二进制数据
(() => {
  const myImage = document.querySelector('img');
  const myRequest = new Request('flowers.jpg');

  fetch(myRequest)
    .then(function(response) {
      return response.blob();
    })
    .then(function(myBlob) {
      let objectURL = URL.createObjectURL(myBlob);
      myImage.src = objectURL;
    });
})();

// Blob 文件下载
(() => {
  const download = (fileName, blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };
  
  const downloadBtn = document.querySelector('#downloadBtn');
  downloadBtn.addEventListener('click', (event) => {
    const fileName = 'blob.txt';
    const myBlob = new Blob(['一文彻底掌握 Blob Web API'], { type: 'text/plain' });
    download(fileName, myBlob);
  });
})();

// 利用 FileReader API，我们也可以方便的实现图片本地预览功能
(() => {
  const loadFile = function(event) {
    const reader = new FileReader();
    reader.onload = function(){
      const output = document.querySelector('output');
      output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
  };
})();

// Blob 转换为 Base64


// 实现图片压缩
(() => {
  const MAX_WIDTH = 800; // 图片最大宽度

  function compress(base64, quality, mimeType) {
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
        ctx.clearRect(0, 0, targetWidth, targetHeight); // 清除画布
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let imageData = canvas.toDataURL(mimeType, quality / 100);
        resolve(imageData);
      };
    });
  }

  // 对于返回的 Data URL 格式的图片数据，为了进一步减少传输的数据量，我们可以把它转换为 Blob 对象
  function dataUrlToBlob(base64, mimeType) {
    let bytes = window.atob(base64.split(',')[1]);
    let ab = new ArrayBuffer(bytes.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  }

  // 在转换完成后，我们就可以压缩后的图片对应的 Blob 对象封装在 FormData 对象中，然后再通过 AJAX 提交到服务器上

  function uploadFile(url, blob) {
    let formData = new FormData();
    let request = new XMLHttpRequest();
    formData.append('image', blob);
    request.open('POST', url, true);
    request.send(formData);
  }

  const loadFile = function (event) {
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
})();
