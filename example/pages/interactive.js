const {
  customElements,
  HTMLElement,
  html
} = require('../../index');
const { getStates } = require('../services/states');


const page = customElements.defineWithRender('home-page', class extends HTMLElement {
  constructor() {
    super();
    this.list = [];
    this.states = [];
    this.cities = [];
    this.selectedState = null;
    this.selectedCity = null;
  }

  async connectedCallback() {
    const [ listData, stateData ] = await Promise.all([
      axios.get('/api/list'),
      axios.get('/api/states')
    ]);
    this.list = listData.list;
    this.stateData = listData.states;
    this.render();
  }

  template() {
    return html`
      <div id="content">
        <h2>Interactive</h2>

        <div>
          <select onchange="$homePage.stateSelectChange(this.value)">
            <option value="" disabled ${this.selectedState === null ? 'selected' : ''}>State...</option>
            ${this.states.map(s => html`
              <option value="${s.name}" ${this.selectedState === s.name ? 'selected' : ''}>${s.name}</option>
            `).join('/n')}
          </select>

          <select onchange="$homePage.citySelectChange(this.value)">
            <option value="" disabled ${this.selectedCity === null ? 'selected' : ''}>City...</option>
            ${this.states.map(c => html`
              <option value="${c.name}" ${this.selectedCity === c.name ? 'selected' : ''}>${c.name}</option>
            `).join('/n')}
          </select>
        </div>
      </div>
    `;
  }

  stateSelectChange(value) {
    console.log('stateSelectChange', value);
    this.selectedState = value;
    const state = this.states.find(i => i.name === value);
    if (state) this.cities = state.cities;
    else this.cities = [];
    this.render();
  }

  citySelectChange(value) {
    console.log('stateSelectChange', value);
    this.selectedCity = value;
  }
});

module.exports = async () => {
  const states = getStates();

  return {
    title: 'Interactive',
    body: page.template({ states })
  };
};
