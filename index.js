const customElements = require('./src/customElements');
const HTMLElement = require('./src/HTMLElement');
const PageMapper = require('./src/PageMapper');
const browserScripts = require('./src/browserScripts');
const { html, htmlSafe } = require('common-tags');

module.exports = {
  customElements,
  HTMLElement,
  PageMapper,
  browserScripts,
  htmlSafe,
  html
};
