const HTMLElement = require('./HTMLElement');
const { html } = require('common-tags');

const hyphenCaseReg = /-\w/g;

module.exports = {
  define(name, constructor, options) {
    return new CustomElementsNode(name, constructor, options);
  },

  defineWithRender(name, constructor, options = {}) {
    options._addRenderMethod = true;

    // validate template
    // we need to make sure there is a <div id="content"> container
    const tempClass = new constructor();
    const tempTemplate = tempClass.template();

    if (!tempTemplate.includes('id="content"')) {
      throw Error('defineWithRender requires a container with id="content" (<div id="content"><!-- body here --></div>)');
    }

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
    const elementsClass = new this.modifiedConstructor();
    if (this.hasOriginalConstructor) {
      try {
        elementsClass.constructor_original();
      } catch (e) {
        console.error(e);
      }
    }
    const template = elementsClass.template(Object.assign({}, elementsClass, vm));
    return html`
      <template id="${this.name}">
        ${template}
      </template>
      <${this.name} id="$${toCamelCase(this.name)}"></${this.name}>
      <script>
        customElements.define("${this.name}",` + this.buildClientConstructorString(true) + html`);
      </script>
    `;
  }

  noTemplate() {
    return html`
      <${this.name} id="$${toCamelCase(this.name)}"></${this.name}>
      <script>
        customElements.define("${this.name}",` + this.buildClientConstructorString() + html`);
      </script>
    `;
  }

  buildClientConstructorString(hasTemplate = false) {
    const templateCloner = `
      var template = document.getElementById('${this.name}');
      var templateContent = template.content;
      var shadowRoot = this.shadowRoot ? this.shadowRoot : this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(templateContent.cloneNode(true));
    `;
    const newConstructor = `
    constructor() {
      super();
      ${this.hasOriginalConstructor ? 'this.constructor_original();' : ''}
      ${hasTemplate ? templateCloner : ''}
    }
    `;
    const pos = this.modifiedConstructorString.indexOf('{') + 1;
    if (this.options._addRenderMethod) return [this.modifiedConstructorString.slice(0, pos), newConstructor, this.buildRenderMethod(), this.modifiedConstructorString.slice(pos)].join('');
    return [this.modifiedConstructorString.slice(0, pos), newConstructor, this.modifiedConstructorString.slice(pos)].join('');
  }

  buildRenderMethod() {
    if (this.modifiedConstructorString.indexOf('template(') === -1) {
      throw Error('expected `template` method');
    }
    if (this.modifiedConstructorString.indexOf('id="content"') === -1) {
      throw Error('expected `<div id="content">` wrapper for all html content in template');
    }
    const hasPreRender = this.modifiedConstructorString.indexOf('preRender(') > 0;
    const hasPostRender = this.modifiedConstructorString.indexOf('postRender(') > 0;
    return `
      render() {
        ${hasPreRender ? 'this.preRender()' : ''}
        var templateElement = document.createElement('template');
        templateElement.innerHTML = this.template();
        var clone = templateElement.content.cloneNode(true);
        var shadowRoot = this.shadowRoot ? this.shadowRoot : this.attachShadow({mode: 'open'})
        shadowRoot.querySelector('div#content').innerHTML = clone.querySelector('div#content').innerHTML;
        ${hasPostRender ? 'this.postRender()' : ''}
      }
    `;
  }
};

function toCamelCase(value) {
  return value.replace(hyphenCaseReg, m => m[1].toUpperCase());
}
