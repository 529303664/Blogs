/**
 * 复制文字
 * @param {String} text 文案
 * @deprecated 即将废弃
 */
export function copyToClipboardByexecCommand(text) {
  const textarea = document.createElement('input');// 创建input元素
  const currentFocus = document.activeElement;// 当前获得焦点的元素，保存一下
  document.body.appendChild(textarea);// 添加元素
  textarea.value = text;
  textarea.focus();

  textarea.setSelectionRange(0, textarea.value.length);// 获取光标起始位置到结束位置
  // textarea.select(); 这个是直接选中所有的，效果和上面一样
  let flag = false;
  try {
    flag = document.execCommand('copy');// 执行复制
  } catch (eo) {
    flag = false;
  }
  document.body.removeChild(textarea);// 删除元素
  currentFocus.focus(); // 恢复焦点
  return flag;
}

/**
 * 复制文本
 * @param {String} text 文字
 */
export async function copyTextByClipboard(text) {
  let result = false;
  try {
    await navigator.clipboard.writeText(text);
    result = true;
  } catch (error) {
    console.error('复制失败', error);
  }
  return result;
}

/**
 * 复制blob对象到剪切板，可以应用图片对象
 * @param {Blob} blob blob对象
 * @param {String} type blob类型， 默认text/plain
 */
export async function copyBlobByClipboard(blob, type = 'text/plain') {
  let result = false;
  if (!blob) return result;

  try {
    if (Object.prototype.toString.call(blob) !== '[object Blob]') {
      blob = new Blob([blob], { type });
    }
    await navigator.clipboard.write(
      new ClipboardItem({
        [type]: blob,
      })
    );
    result = true;
  } catch (error) {
    console.error('复制失败', error);
  }

  return result;
}

/**
 * 获取剪切板数据
 */
export async function getTextByClipboard() {
  let text;
  try {
    text = await navigator.clipboard.readText();
  } catch (error) {
    console.log('读取剪贴板内容失败', error);
  }

  return text;
}

/**
 * 读取剪贴板数据，返回blob数组
 */
export async function getBlobsByClipboard() {
  const blobs = [];
  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        const blob = await clipboardItem.getType(type);
        blobs.push(blob);
        // console.log('已读取剪贴板中的内容：', await blob.text());
      }
    }
  } catch (err) {
    console.error('读取剪贴板内容失败: ', err);
    return false;
  }

  return blobs;
}

/**
 * 请求剪贴板写权限
 * @description 默认情况下，会为当前的激活的页面自动授予剪贴板的写入权限。出于安全方面考虑，这里我们还是主动向用户请求剪贴板的写入权限
 */
export async function askWritePermission() {
  try {
    const { state } = await navigator.permissions.query({
      name: 'clipboard-write',
    });
    return state === 'granted';
  } catch (error) {
    return false;
  }
}


export async function createImageBlob(url) {
  const response = await fetch(url);
  return await response.blob();
}

export function createTextBlob(text) {
  return new Blob([text], { type: 'text/plain' });
}

/**
 * 选择元素对象,用于将ClibBoard对象粘贴
 * @param {Element} element 元素对象
 */
export function select(element) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 *复制blob数组对象到Clipboard
 * @param {Blob[]} blobs blob对象数组
 */
export async function writeDataToClipboardWithPermission(blobs) {
  let result = false;
  if (await askWritePermission()) {
    if (navigator.clipboard && navigator.clipboard.write) {
      try {
        const clipboardItemOptions = {};
        for (const blob of blobs) {
          clipboardItemOptions[blob.type] = blob;
        }
        const item = new ClipboardItem(clipboardItemOptions);
        select(document.querySelector('#container'));
        await navigator.clipboard.write([item]);
        result = true;
      } catch (error) {
        console.error('文本和图像复制失败', error);
      }
    }
  }

  return result;
}

async function testWriteDataToClipboard() {
  const text = createTextBlob('hello，我是Lucas');
  const image = createImageBlob('http://cdn.semlinker.com/abao.png');
  const result = await writeDataToClipboard([ text, image ]);
  return result;
}

/**
 * 请求剪贴板读取权限
 */
export async function askReadPermission() {
  try {
    const { state } = await navigator.permissions.query({
      name: 'clipboard-read',
    });
    return state === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * 读取剪贴板中已写入的数据
 */
export async function readDataFromClipboardWithPermission() {
  const blobs = [];
  if (!await askReadPermission()) {
    return false;
  }

  if (!navigator.clipboard || !navigator.clipboard.read) {
    return false;
  }

  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      console.dir(clipboardItem);
      for (const type of clipboardItem.types) {
        const blob = await clipboardItem.getType(type);
        blobs.push(blob);
        // console.log('已读取剪贴板中的内容：', await blob.text());
      }
    }
  } catch (err) {
    console.error('读取剪贴板内容失败: ', err);
  }

  return blobs;
}

/**
 * 监听粘贴事件，返回text
 * @param {Function} cb 回调函数 (text) => any
 * @param {Boolean} preventDefault
 */
export function onPasteToText(cb, preventDefault = false) {
  typeof cb !== 'function' && (cb = () => {});
  document.addEventListener('paste', async e => {
    preventDefault && e.preventDefault();
    let text;
    if (navigator.clipboard) {
      text = await navigator.clipboard.readText();
    } else {
      text = e.clipboardData.getData('text/plain');
    }
    cb(text);
    // console.log('已获取的文本数据: ', text);
  });
}

/**
 * 监听粘贴事件，返回blob数组
 * @param {Function} cb 回调函数 (blobs) => any
 * @param {Boolean} preventDefault
 */
export function onPasteToBlobs(cb, preventDefault = false) {
  const IMAGE_MIME_REGEX = /^image\/(p?jpeg|gif|png)$/i;
  typeof cb !== 'function' && (cb = () => {});

  const blobs = [];
  document.addEventListener('paste', async e => {
    preventDefault && e.preventDefault();
    if (navigator.clipboard) {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (IMAGE_MIME_REGEX.test(type)) {
            const blob = await clipboardItem.getType(type);
            blobs.push(blob);
            // loadImage(blob);
            // return;
          }
        }
      }
    } else {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (IMAGE_MIME_REGEX.test(items[i].type)) {
          blobs.push(items[i].getAsFile());
          // loadImage(items[i].getAsFile());
          // return;
        }
      }
    }
    cb(blobs);
  });

}

/**
 * 用于实现把复制的图片插入到当前选区已选择的区域中
 * @param {File} file file对象
 */
export async function loadImage(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const { result } = e.target;
      resolve(result);
      // const img = document.createElement('img');
      // img.src = e.target.result;

    // const range = window.getSelection().getRangeAt(0);
    // range.deleteContents();
    // range.insertNode(img);
    };
    reader.readAsDataURL(file);
  });
}

