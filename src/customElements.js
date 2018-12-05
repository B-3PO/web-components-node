const HTMLElement = require('./HTMLElement');
const config = require('./config');
const { html } = require('common-tags');
const minifyHTML = require('html-minifier').minify;
const uglifyJS = require('uglify-es');
const { memoize } = require('./cache');

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
    this.renderTemplate = true;

    // setup global config
    this.templateMethodName = config.get('templateMethod');
    this.minify = config.get('minify');
    if (config.get('memoize')) {
      this.buildWithoutMemoize = this.build;
      this.build = memoize(this.build.bind(this));
    }
  }

  getClassAsString(hasTemplate) {
    const classString = `customElements.define("${this.name}",` + this.buildClientConstructorString(hasTemplate) + html`);`;
    if (this.minify) return uglifyJS.minify(classString).code;
    else return classString;
  }

  getTemplateElementAsString(vm) {
    const elementsClass = new this.modifiedConstructor();
    if (this.hasOriginalConstructor) {
      try {
        elementsClass.constructor_original();
      } catch (e) {
        console.error(e);
      }
    }
    // add passed in data to class, this will make it accessible on "this"
    Object.assign(elementsClass, vm);
    console.log(this.templateMethodName)
    const template = `
      <template id="${this.name}">
        ${elementsClass[this.templateMethodName]()}
      </template>
    `;

    if (!this.minify) return template;
    else return minifyHTML(template, {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: false,
      removeAttributeQuotes: true,
      removeEmptyAttributes: false,
      minifyJS: false,
      minifyCSS: true
    });
  }

  build(vm) {
    if (this.renderTemplate) return this.buildWithTemplate(vm);
    else return this.buildWithoutTemplate();
  }

  buildWithTemplate(vm = {}) {
    return html`
      ${this.getTemplateElementAsString(vm)}
      <${this.name} id="$${toCamelCase(this.name)}"></${this.name}>
      <script>${this.getClassAsString(true)}</script>
    `;
  }

  buildWithoutTemplate() {
    return html`
      <${this.name} id="$${toCamelCase(this.name)}"></${this.name}>
      <script>${this.getClassAsString()}</script>
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
        templateElement.innerHTML = this.${this.templateMethodName}();
        var clone = templateElement.content.cloneNode(true);
        var shadowRoot = this.shadowRoot ? this.shadowRoot : this.attachShadow({mode: 'open'});
        var shadowContentDiv = shadowRoot.querySelector('div#content');
        if (!shadowContentDiv) shadowRoot.appendChild(clone);
        else shadowContentDiv.innerHTML = clone.querySelector('div#content').innerHTML;
        ${hasPostRender ? 'this.postRender()' : ''}
      }
    `;
  }
};

function toCamelCase(value) {
  return value.replace(hyphenCaseReg, m => m[1].toUpperCase());
}
