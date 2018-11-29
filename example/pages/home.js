const { html } = require('common-tags');
const {
  customElements,
  HTMLElement
} = require('../../index');


const page = customElements.define('404-page', class extends HTMLElement {
  template() {
    return html`
      <h4>Page not found.</h4>
    `;
  }
});

module.exports = async () => ({
  title: '404',
  body: page.template()
});
