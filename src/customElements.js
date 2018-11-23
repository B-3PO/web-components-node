const HTMLElement = require('./HTMLElement');
const { html } = require('common-tags');

module.exports = {
  define(name, constructor, options) {
    return new CustomElementsNode(name, constructor, options);
  }
};

class CustomElementsNode {
  constructor(name, constructor, options = {}) {
    this.name = name;
    this.constructor = constructor;
    this.options = options;
    this.hasOriginalConstructor = constructor.toString().indexOf('constructor(') > 0;
    this.modifiedConstructorString = constructor.toString()
      .replace('constructor(', 'constructor_original(')
      .replace('super();', '')
      .replace('super()', '');
    this.modifiedConstructor = eval('('+this.modifiedConstructorString+')');
  }

  template(vm) {
    const template = new this.modifiedConstructor().template(vm);
    return html`
      <template id="${this.name}">
        ${template}
      </template>
      <${this.name}></${this.name}>
      <script>
        customElements.define("${this.name}",` + buildClientConstructorString(this.name, this.hasOriginalConstructor, this.modifiedConstructorString, true) + html`);
      </script>
    `;
  }

  noTemplate() {
    return html`
      <${this.name}></${this.name}>
      <script>
        customElements.define("${this.name}",` + buildClientConstructorString(this.name, this.hasOriginalConstructor, this.modifiedConstructorString) + html`);
      </script>
    `;
  }
};


function buildClientConstructorString(name, hasOriginalConstructor, constructorString, hasTemplate = false) {
  const templateCloner = `
    var template = document.getElementById('${name}');
    var templateContent = template.content;
    var shadowRoot = this.shadowRoot ? this.shadowRoot : this.attachShadow({mode: 'open'})
    shadowRoot.appendChild(templateContent.cloneNode(true));
  `;
  const newConstructor = `
  constructor() {
    super();
    ${hasOriginalConstructor ? 'this.constructor_original();' : ''}
    ${hasTemplate ? templateCloner : ''}
  }
  `;
  const pos = constructorString.indexOf('{') + 1;
  return [constructorString.slice(0, pos), newConstructor, constructorString.slice(pos)].join('');
}
