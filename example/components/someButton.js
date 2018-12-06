// This file in includes in ./index.js

// basic page that uses server side rendering
const {
  customElements,
  HTMLElement,
  html,
  registerComponent
} = require('../../index');

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Autonomous_custom_elements
registerComponent(customElements.define('some-button', class extends HTMLElement {
  connectedCallback() {
    this.shadowRoot.querySelector('#button').addEventListener('click', this.onClick);
  }
  /*
   * Template is a custom methods that is used for server side rendering and is not part of the customElements spec
   * You can change the template method
   * https://github.com/B-3PO/web-components-node#Config
   */
  template() {
    return html`
      <button id="button">some button</button>
    `;
  }

  onClick() {
    alert('clicked');
  }
}));
