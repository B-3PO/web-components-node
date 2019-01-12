const HTMLElement = require('./HTMLElement');

module.exports = class Document {
  createElement() {
    return new HTMLElement();
  }
};
