const customElements = require('./src/customElements');
const HTMLElement = require('./src/HTMLElement');
const PageMapper = require('./src/PageMapper');
const inject = require('./src/inject');
const staticFileHandler = require('./src/client-files');
const { registerComponent } = require('./src/componentRegistry');
const { set } = require('./src/config');
const { html, htmlSafe } = require('common-tags');

module.exports = {
  customElements,
  HTMLElement,
  PageMapper,
  inject,
  htmlSafe,
  html,
  setConfig: set,
  registerComponent,
  staticFileHandler
};
