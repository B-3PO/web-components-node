const {
  customElements,
  HTMLElement,
  html
} = require('../../index');
const { getList } = require('../services/list');


const page = customElements.defineWithRender('home-page', class extends HTMLElement {
  constructor() {
    super();
    this.list = [];
  }

  async connectedCallback() {
    const { data } = await axios.get('/api/list');
    this.list = data.list;
    this.render();
  }

  template() {
    return html`
      <div id="content">
        <h2>List Client Render</h2>

        <div>
          <ul>
            ${this.list.map(i => (
              `<li>${i.name}</li>`
            )).join('\n')}
          </ul>
        </div>
      </div>
    `;
  }
});

module.exports = async () => {
  const list = getList();

  return {
    title: '404',
    body: page.noTemplate()
  };
};
