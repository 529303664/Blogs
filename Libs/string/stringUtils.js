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
