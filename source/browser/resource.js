import { BASIC_EXTENSION_MAP } from '@dr-js/core/module/common/module/MIME.js'
import { createElement } from '@dr-js/core/module/browser/DOM.js'

const { document, fetch } = window

// TODO: check if is needed, or simplify
const loadText = async (uri) => (await fetch(uri)).text()
const loadImage = (uri) => new Promise((resolve, reject) => createElement('img', {
  src: uri,
  onerror: reject,
  onload: (event) => resolve(event.currentTarget)
}))
// TODO: document.body can be null if script is running from <head> tag and page is not fully loaded
const loadScript = (uri) => new Promise((resolve, reject) => document.body.appendChild(createElement('script', {
  src: uri,
  async: false,
  type: BASIC_EXTENSION_MAP.js,
  onerror: reject,
  onload: (event) => resolve(event.currentTarget)
})))

export {
  loadText,
  loadImage,
  loadScript
}
