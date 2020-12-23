class Toast {
  constructor() {
    this.options = {
      text: '',
      backgroundColor: '#ffc107',
      color: '#000',
    };
  }

  render(params) {
    if (params instanceof Object) {
      this.options = Object.assign(this.options, params);
    } else {
      this.options.text = params;
    }

    const dom = document.createElement('div');
    const HTML = `<P class="tips-content text-center" style="color: ${this.options.color};font-size: 15px">${this.options.text}</P>`;
    const styleObject = {
      background: this.options.backgroundColor,
      padding: '10px 15px',
      position: 'fixed',
      zIndex: '9999',
      top: '80px',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      webkitTransform: 'translate(-50%, -50%)',
      borderRadius: '5px',
      // wordBreak: 'break-all'
    };

    Object.keys(styleObject).forEach(key => {
      dom.style[key] = styleObject[key];
    });

    dom.className = 'btoast';
    dom.innerHTML = HTML;

    if (typeof this.options.el === 'object') {
      this.options.el.appendChild(dom);
    } else {
      document.body.appendChild(dom);
    }

    setTimeout(() => {
      if (typeof this.options.el === 'object') {
        this.options.el.removeChild(dom);
      } else {
        document.body.removeChild(dom);
      }

      if (typeof this.options.callback === 'function') {
        this.options.callback();
      }
    }, this.options.delay || 3500);
  }

  show(options) {
    this.render(options);
  }
}

const toast = new Toast();
export default toast;
