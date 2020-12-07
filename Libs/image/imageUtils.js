export function imageInfo(url) {
  return new Promise(resolve => {
    let info = { w: 0, h: 0, base64: '' };

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
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