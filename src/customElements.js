/*
 * customElemnts
 * browser spec v1: https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements
 * This is the meat and potatos, or rice and beans if you don't eat meat
 * customElemnts follows the spec very closley but also add a few custom methods for serverside rendering.
 * The goal is to allow the classes to be copied and pasted into a browser and still work
 */

const HTMLElement = require('./HTMLElement');
const config = require('./config');
const { html } = require('common-tags');
const minifyHTML = require('html-minifier').minify;
const uglifyJS = require('uglify-es');
const { memoize } = require('./cache');

const hyphenCaseReg = /-\w/g;

module.exports = {
  // https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
  define(name, constructor, options) {
    return new CustomElementsNode(name, constructor, options);
  },

  /*
   * This is a custom method for adding in a `render` method
   * This will make it so you can use a single template method to render on the server and browser
   * you can always implament your own render method
   */
  defineWithRender(name, constructor, options = {}) {
    options._addRenderMethod = true;

    // validate template
    // we need to make sure there is a <div id="content"> container
    // TODO probably want to change the div id or use a custom tag
    const tempClass = new constructor();
    const tempTemplate = tempClass.template();
    if (!tempTemplate.includes('id="content"')) {
      throw Error('defineWithRender requires a container with id="content" (<div id="content"><!-- body here --></div>)');
    }
    return new CustomElementsNode(name, constructor, options);
  }
};

class CustomElementsNode {
  // TODO make this funtion campatable with transpiled code. Currently it will not work
  constructor(name, constructor, options = {}) {
    this.name = name;
    this.constructor = constructor;
    this.options = options;
    this.hasOriginalConstructor = constructor.toString().indexOf('constructor(') > 0;
    // rename constructor so we can add our own with some injected code
    this.modifiedConstructorString = constructor.toString()
      .replace('constructor(', 'constructor_original(')
      .replace('super();', '') // remove super with semi-colin
      .replace('super()', ''); // remove super without semi-colin
    this.modifiedConstructor = eval('('+this.modifiedConstructorString+')');
    this.renderTemplate = true;

    // setup global config
    this.templateMethodName = config.get('templateMethod');
    this.minify = config.get('minify');
    this.buildWithoutMemoize = this.build; // provide a way to not memoize specific methods
    if (config.get('memoize')) this.build = memoize(this.build.bind(this));
  }

  // Internally used method
  getClassAsString(hasTemplate) {
    const classString = `customElements.define("${this.name}",` + this.buildClientConstructorString(hasTemplate) + html`);`;
    if (this.minify) return uglifyJS.minify(classString).code;
    else return classString;
  }

  // Internally used method
  getTemplateElementAsString(vm) {
    // add passed in data to class. We want to make it accessible on "this"
    const elementsClass = new this.modifiedConstructor();
    if (this.hasOriginalConstructor) {
      try {
        elementsClass.constructor_original();
      } catch (e) {
        console.error(e);
      }
    }
    Object.assign(elementsClass, vm);

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

  // the suggested method to run serverside
  build(vm) {
    if (this.renderTemplate) return this.buildWithTemplate(vm);
    else return this.buildWithoutTemplate();
  }

  // build just the template element
  buildWithTemplate(vm = {}) {
    return html`
      ${this.getTemplateElementAsString(vm)}
      <${this.name} id="$${toCamelCase(this.name)}"></${this.name}>
      <script>${this.getClassAsString(true)}</script>
    `;
  }

  // build just the class
  buildWithoutTemplate() {
    return html`
      <${this.name} id="$${toCamelCase(this.name)}"></${this.name}>
      <script>${this.getClassAsString()}</script>
    `;
  }

  buildClientConstructorString(hasTemplate = false) {
    // This is injected if a tempalte is created server side
    const templateCloner = `
      var template = document.getElementById('${this.name}');
      var templateContent = template.content;
      var shadowRoot = this.shadowRoot ? this.shadowRoot : this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(templateContent.cloneNode(true));
    `;

    // This is injected to allow a template cloner to be used
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

  // This is injected if you use `defineWithRender`
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
