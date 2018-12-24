const customElements = require('./src/customElements');
const HTMLElement = require('./src/HTMLElement');
const PageMapper = require('./src/PageMapper');
const inject = require('./src/inject');
const fileHandler = require('./src/fileHandler');
const { registerComponent } = require('./src/componentRegistry');
const { set } = require('./src/config');
const { html, htmlSafe } = require('common-tags');

module.exports = {
  customElements,
  HTMLElement,
  PageMapper,
  htmlSafe,
  html,
  setConfig: set,
  registerComponent,
  fileHandler
};
