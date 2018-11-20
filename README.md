# customelementsNode

# Example:
```javascript
const { html } = require('common-tags');
const {
  customElements,
  HTMLElement
} = require('customElementsNode');

const page = customElements.define('index-page', class extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({mode: "open"});
    this.name = 'client';
    setTimeout(() => {
      this.render();
    }, 2000);
  }

  template(vm) {
    vm = vm || this;
    return html`
      <div>hello world from ${vm.name}</div>
    `;
  }

  render() {
    this.root.innerHTML = this.template();
  }
});

module.exports = async () => {
  const name = 'server';
  return page.template({ name: name });
}
```
