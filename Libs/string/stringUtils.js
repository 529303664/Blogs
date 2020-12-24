/**
 * string To Base64
 * @param {String} stringToEncode
 */
export function stringToBase64(stringToEncode) {
  return window.btoa(stringToEncode);
}

/**
 * Base64 to String
 * @param {String} encodedData
 */
export function base64ToString(encodedData) {
  return window.atob(encodedData);
}

export function chr(codePt) {
  //  discuss at: https://locutus.io/php/chr/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Brett Zamir (https://brett-zamir.me)
  //   example 1: chr(75) === 'K'
  //   example 1: chr(65536) === '\uD800\uDC00'
  //   returns 1: true
  //   returns 1: true
  if (codePt > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
    //   enough for the UTF-16 encoding (JavaScript internal use), to
    //   require representation with two surrogates (reserved non-characters
    //   used for building other characters; the first is "high" and the next "low")
    codePt -= 0x10000;
    return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  }
  return String.fromCharCode(codePt);
}

export function str_repeat(input, multiplier) { // eslint-disable-line camelcase
  //  discuss at: https://locutus.io/php/str_repeat/
  // original by: Kevin van Zonneveld (https://kvz.io)
  // improved by: Jonas Raoni Soares Silva (https://www.jsfromhell.com)
  // improved by: Ian Carter (https://euona.com/)
  //   example 1: str_repeat('-=', 10)
  //   returns 1: '-=-=-=-=-=-=-=-=-=-='
  let y = '';
  while (true) {
    if (multiplier & 1) {
      y += input;
    }
    multiplier >>= 1;
    if (multiplier) {
      input += input;
    } else {
      break;
    }
  }
  return y;
}
