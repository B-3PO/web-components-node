const {
  customElements,
  HTMLElement,
  html
} = require('../../index');


const page = customElements.defineWithRender('home-page', class extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  template() {
    return html`
      <div id="content">
        <h4>Page not found.</h4>
      </div>
    `;
  }
});

module.exports = async () => ({
  title: '404',
  body: page.template()
});
