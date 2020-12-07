export function videoInfo(url) {
  return new Promise(async resolve => {
    let info = { w: 0, h: 0, bg: '', bgSize: 0};
    const Vobject = document.createElement('VIDEO');
    Vobject.setAttribute('controls', 'controls');
    Vobject.setAttribute('src', url);
    Vobject.setAttribute('style', 'display: none;');
    Vobject.addEventListener('loadedmetadata', async function () {

      info.w = this.videoWidth;
      info.h = this.videoHeight;
      info.duration = this.duration;
      let canvas, ctx;

      if (this.videoWidth && this.videoHeight) {
        canvas = document.createElement('canvas');
        canvas.width = this.videoWidth;
        canvas.height = this.videoHeight;
        ctx = canvas.getContext('2d');
        ctx.drawImage(Vobject, 0, 0, this.videoWidth, this.videoHeight, 0, 0, this.videoWidth, this.videoHeight);

        info.bg = canvas.toDataURL('image/jpeg');

        info.blob = await new Promise(resolve => {
          canvas.toBlob((blob) => {
            resolve(blob);
          });
        });
        
      }

      document.body.appendChild(Vobject);

      resolve(info);

      setTimeout(() => {
        Vobject.remove();
        canvas && ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 1000);
    });
  });
}