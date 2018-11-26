# customelementsNode

# Example:

```javascript
const { html } = require('common-tags');
const {
  customElements,
  HTMLElement
} = require('customElementsNode');

const page = customElements.defineWidthRender('index-page', class extends HTMLElement {
  // this gets called on both the server and browser
  constructor() {
    super();
    this.name = 'client';
  }

  // this will only run in the browser
  // you can do all you data fetching and re rendering in here
  connectedCallback() {
    setTimeout(() => {
      // the render method is injected by customElements.defineWidthRender
      // if you just use define then there will be no render method
      // render will only replace the content in <div id="content">
      this.render();
    }, 2000);
  }

  // the preRender method is called when the injected render method from customElements.defineWidthRender is invoked
  preRender() {

  }
  // the postRender method is called when the injected render method from customElements.defineWidthRender is invoked
  postRender() {

  }

  template(vm) {
    vm = vm || this;
    return html`
      <style>
      </style>

      <!-- <div id="render"> is required for the injected render method to work -->
      <div id="content">
        <div>hello world from ${vm.name}</div>

        <!-- $indexPage is added for you. This will give you access to the class -->
        <button onclick="$indexPage.testClick(this, 'someothervalue')">test</button>
      </div>
    `;
  }

  testClick(element, text) {
    alert('the button was clicked');
  }
});

module.exports = async () => {
  const name = 'server';
  return page.template({ name: name });
}
```
