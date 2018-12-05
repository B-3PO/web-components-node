/*
 * fully interactive page
 * Renders on serverside
 */
const {
  customElements,
  HTMLElement,
  html
} = require('../../index');
const { getList } = require('../services/list');

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Autonomous_custom_elements
const page = customElements.defineWithRender('home-page', class extends HTMLElement {
  constructor() {
    super();
    this.list = [];
  }

  /*
   * Template is a custom methods that is used for server side rendering and is not part of the customElements spec
   * You can change the template method
   * https://github.com/B-3PO/customElementsNode#Config
   */
  template() {
    return html`
      <div id="content">
        <h2>List</h2>

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

module.exports = async () => {
  const list = getList();

  return {
    title: 'List',
    body: page.build({ list })
  };
};
