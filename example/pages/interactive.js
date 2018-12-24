/*
 * fully interactive page
 * Initially renders on serverside
 * Client re-renders page on state selection
 */
const {
  customElements,
  HTMLElement,
  html
} = require('../../index');
const { getStates } = require('../services/states');

// https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Autonomous_custom_elements
const page = customElements.exportWithRender('home-page', class extends HTMLElement {
  constructor() {
    super();
    this.list = [];
    this.states = [];
    this.cities = [];
    this.selectedState = null;
    this.selectedCity = null;
  }

  /*
   * this only runs client side
   * https://developer.mozilla.org/en-US/docs/Web/Web_Components#Reference
   */
  async connectedCallback() {
    const { data } = await axios.get('/api/states');
    this.states = data.states;
    this.render();
  }

  /*
   * Template is a custom methods that is used for server side rendering and is not part of the customElements spec
   * You can change the template method
   * https://github.com/B-3PO/web-components-node#Config
   */
  template() {
    return html`
      <render-block>
        <h2>Interactive</h2>

        <div>
          <select onchange="$homePage.stateSelectChange(this.value)">
            <option value="" disabled ${this.selectedState === null ? 'selected' : ''}>State...</option>
            ${this.states.map(s => html`
              <option value="${s.name}" ${this.selectedState === s.name ? 'selected' : ''}>${s.name}</option>
            `).join('\n')}
          </select>

          <select onchange="$homePage.citySelectChange(this.value)">
            <option value="" disabled ${this.selectedCity === null ? 'selected' : ''}>City...</option>
            ${this.cities.map(c => html`
              <option value="${c.name}" ${this.selectedCity === c.name ? 'selected' : ''}>${c.name}</option>
            `).join('\n')}
          </select>
        </div>
      </render-block>
    `;
  }

  stateSelectChange(value) {
    this.selectedState = value;
    const state = this.states.find(i => i.name === value);
    if (state) this.cities = state.cities;
    else this.cities = [];
    this.selectedCity = null;
    this.render();
  }

  citySelectChange(value) {
    this.selectedCity = value;
  }
});

module.exports = async () => {
  const states = await getStates();
  return {
    title: 'Interactive',
    body: page.build({ states })
  };
};
