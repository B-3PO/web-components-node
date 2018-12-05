// basic page that uses server side rendering
const {
  customElements,
  HTMLElement,
  html
} = require('../../index');

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Autonomous_custom_elements
const page = customElements.define('home-page', class extends HTMLElement {
  /*
   * Template is a custom methods that is used for server side rendering and is not part of the customElements spec
   * You can change the template method
   * https://github.com/B-3PO/customElementsNode#Config
   */
  template() {
    return html`
      <div id="content">
        <h2>Home</h2>

        <!-- this component is loaded via ../components -->
        <some-button></some-button>
      </div>
    `;
  }
});

module.exports = async () => ({
  title: 'Home',
  body: page.build()
});
