/*
 * dynamic template
 * Client side rendering only
 */
const {
  customElements,
  HTMLElement,
  html
} = require('../../index');

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Autonomous_custom_elements
const page = customElements.defineWithRender('home-page', class extends HTMLElement {
  constructor() {
    super();
    this.list = [];
  }

  /*
   * this only runs client side
   * https://developer.mozilla.org/en-US/docs/Web/Web_Components#Config
   */
  async connectedCallback() {
    const { data } = await axios.get('/api/list');
    this.list = data.list;
    this.render();
  }

  /*
   * Template is a custom methods that is used for server side rendering and is not part of the customElements spec
   * You can change the template method
   * https://github.com/B-3PO/customElementsNode#Introduction
   */
  template() {
    return html`
      <div id="content">
        <h2>List Client Render</h2>

        <div>
          <ul>
            ${this.list.map(i => html`
              <li>${i.name}</li>
            `).join('\n')}
          </ul>
        </div>
      </div>
    `;
  }
});

// this will prevent a template from being generated
page.renderTemplate = false;

module.exports = async () => {
  return {
    title: 'List Client Render',
    body: page.build()
  };
};
