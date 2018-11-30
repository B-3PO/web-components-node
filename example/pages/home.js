const {
  customElements,
  HTMLElement,
  html
} = require('../../index');


const page = customElements.define('home-page', class extends HTMLElement {
  template() {
    return html`
      <div id="content">
        <h2>Home</h2>
      </div>
    `;
  }
});

module.exports = async () => ({
  title: 'Home',
  body: page.template()
});
