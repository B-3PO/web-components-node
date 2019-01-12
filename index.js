const customElements = require('./src/customElements');
const HTMLElement = require('./src/HTMLElement');
const Document = require('./src/Document');
const PageMapper = require('./src/PageMapper');
const fileHandler = require('./src/fileHandler');
const { registerComponent } = require('./src/componentRegistry');
const { set } = require('./src/config');
const { html, htmlSafe } = require('common-tags');

module.exports = {
  customElements,
  document: new Document(),
  HTMLElement,
  PageMapper,
  htmlSafe,
  html,
  setConfig: set,
  registerComponent,
  fileHandler
};
