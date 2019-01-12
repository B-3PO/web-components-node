// TODO what else needs to be mocked out in this?

/*
 * Mock for HTMLElement
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
 * This will allow you us to run the classes in node
 */
module.exports = class HTMLElement {
  constructor() {
    this.style = {};
  }
  appendChild() {}
  attachShadow() {
    this.shadowRoot = new ShadowRoot();
  }
  hasAttribute() {}
  getAttribute() {}
  setAttribute() {}
  removeAttribute() {}
  addEventListener() {}
  removeEventListener() {}
  getAttribute() {
    return '';
  }
  hasAttribute() {}
  setAttribute() {}
};

class ShadowRoot {
  innerHTML() {}
}
