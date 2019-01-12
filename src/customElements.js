/*
 * customElemnts
 * browser spec v1: https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements
 * This is the meat and potatos, or rice and beans if you don't eat meat
 * customElemnts follows the spec very closley but also add a few custom methods for serverside rendering.
 * The goal is to allow the classes to be copied and pasted into a browser and still work
 */

const HTMLElement = require('./HTMLElement');
const Document = require('./Document');
const document = new Document();
const config = require('./config');
const { html } = require('common-tags');
const minifyHTML = require('html-minifier').minify;
const uglifyJS = require('uglify-es');
const { memoize } = require('./cache');
const { registerComponent } = require('./componentRegistry');

const hyphenCaseReg = /-\w/g;

module.exports = {
  // https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
  // This will be included with the components packed for the client
  define(name, constructor, options = {}) {
    // TODO add name validation
    options._registered = true;
    const ce = new CustomElementsNode(name, constructor, options);
    registerComponent(ce);
    return ce
  },

  /*
   * This is a custom method for adding in a `render` method
   * This will make it so you can use a single template method to render on the server and browser
   * you can always implament your own render method
   *
   * This will be included with the components packed for the client
   */
  defineWithRender(name, constructor, options = {}) {
    options._registered = true;
    options._addRenderMethod = true;

    // validate template
    // we need to make sure there is a <div id="content"> container
    // TODO probably want to change the div id or use a custom tag
    const tempClass = new constructor();
    const tempTemplate = tempClass.template();
    if (!tempTemplate.includes('<render-block>')) {
      throw Error('defineWithRender requires a <render-block> (<render-block><!-- body here --></render-block>)');
    }

    const ce = new CustomElementsNode(name, constructor, options);
    registerComponent(ce);
    return ce
  },

  /*
   * This is a custom method for creatin en exportable element
   * The main purpose i to allow you to create a page that is packaged for the client
   *
   * This will NOT be included with the components packed for the client
   */
  export(name, constructor, options = {}) {
    options._exported = true;
    return new CustomElementsNode(name, constructor, options);
  },

  /*
   * This is a custom method for adding in a `render` method
   * This will make it so you can use a single template method to render on the server and browser
   * you can always implament your own render method
   *
   * This will NOT be included with the components packed for the client
   */
  exportWithRender(name, constructor, options = {}) {
    options._exported = true;
    options._addRenderMethod = true;

    // validate template
    // we need to make sure there is a <render-block> container
    const tempClass = new constructor();
    const tempTemplate = tempClass.template();
    if (!tempTemplate.includes('<render-block>')) {
      throw Error('defineWithRender requires a <render-block> (<render-block><!-- body here --></render-block>)');
    }
    return new CustomElementsNode(name, constructor, options);
  }
};

class CustomElementsNode {
  // TODO make this funtion campatable with transpiled code. Currently it will not work
  constructor(name, constructor, options = {}) {
    this._exported = options._exported;
    this.name = name;
    this.constructor = constructor;
    this.options = options;
    this.hasOriginalConstructor = constructor.toString().indexOf('constructor(') > 0;
    this.hasTemplate = constructor.toString().indexOf('template(') > 0;
    // rename constructor so we can add our own with some injected code
    this.modifiedConstructorString = constructor.toString()
      .replace('constructor(', 'constructor_original(')
      .replace('super();', '') // remove super with semi-colin
      .replace('super()', ''); // remove super without semi-colin
    this.modifiedConstructor = eval('('+this.modifiedConstructorString+')');
    this.title = this.modifiedConstructor.title;
    this.renderTemplate = true;

    // setup global config
    this.templateMethodName = config.get('templateMethod');
    // this.minify = config.get('minify');
    // this.memoize = config.get('memoize');
  }

  // Internally used method
  getClassAsString(options) {
    const classString = `customElements.define("${this.name}",` + this.buildClientConstructorString(options) + html`);`;
    // if (this.minify) return uglifyJS.minify(classString).code;
    return classString;
  }

  getExternalCSS() {
    const elementsClass = new this.modifiedConstructor();
    // return if there is no externalCSS method
    if (!elementsClass.externalCSS) return '';
    return elementsClass.externalCSS();
  }

  // Internally used method
  getTemplateElementAsString(vm) {
    return`
      <template id="${this.name}">
        <style>
          @import 'wcn.css';
        </style>
        ${this._elementTemplate(vm)}
      </template>
    `;

    // TODO figure out where i should implement this
    // if (!this.minify) return template;
    // else return minifyHTML(template, {
    //   removeComments: true,
    //   collapseWhitespace: true,
    //   collapseBooleanAttributes: false,
    //   removeAttributeQuotes: true,
    //   removeEmptyAttributes: false,
    //   minifyJS: false,
    //   minifyCSS: true
    // });
  }

  // Internally used method
  getTemplateElementAsIIFE(vm) {
    return `(function(){
  var t=document.createElement('template');
  t.setAttribute('id','${this.name}');
  t.innerHTML=\`${this._elementTemplate(vm)}\`;
  document.body.insertAdjacentElement('beforeend', t);
}());`;

// TODO figure out where to minify
// t.innerHTML='${this.minify ?
//   minifyHTML(this._elementTemplate(vm), {
//     removeComments: true,
//     collapseWhitespace: true,
//     collapseBooleanAttributes: false,
//     removeAttributeQuotes: true,
//     removeEmptyAttributes: false,
//     minifyJS: false,
//     minifyCSS: true
//   }) : this._elementTemplate(vm)}';
  }

  // the suggested method to run serverside
  build(vm = {}) {
    const template = this._elementTemplate(vm);
    return {
      title: this.title,
      body: `
        ${this.getTemplateElementAsString(vm)}
        <pre-rendered>
          ${template}
        </pre-rendered>
      `,
      head: `
        <script>
          // wait for page to bee ready
          setTimeout(() => {
            ${this.getClassAsString(true)}
            const el = document.createElement("${this.name}");
            el.id = "$${toCamelCase(this.name)}";
            el.style = 'display: block; height: 0; overflow: hidden;';
            const preRendered = document.querySelector('pre-rendered');
            if (preRendered) {
              preRendered.parentNode.insertBefore(el, preRendered);

              // wait for component to be initiated
              setTimeout(() => {

                // wait for nested components to render
                setTimeout(() => {
                  // swap out static html for component
                  el.style = '';
                  preRendered.remove();
                }, 0);
              }, 0);
            }
          }, 0);
        </script>
      `
    };
  }

  buildClientConstructorString(options = {}) {
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
      ${(options.renderTemplate !== false && this.hasTemplate) ? templateCloner : ''}
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
    if (this.modifiedConstructorString.indexOf('<render-block>') === -1) {
      throw Error('expected `<render-block>` wrapper for all html content in template');
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
        var shadowContentDiv = shadowRoot.querySelector('render-block');
        if (!shadowContentDiv) shadowRoot.appendChild(clone);
        else shadowContentDiv.innerHTML = clone.querySelector('render-block').innerHTML;
        ${hasPostRender ? 'this.postRender()' : ''}
      }
    `;
  }


  // --- PRIVATE ----------------------------------------

  // TODO use this in other functions
  _ElementClassInstance(vm = {}) {
    const elementsClass = new this.modifiedConstructor();
    if (this.hasOriginalConstructor) {
      try {
        elementsClass.constructor_original();
      } catch (e) {
        console.error(e);
      }
    }
    Object.assign(elementsClass, vm);
    return elementsClass;
  }
  // TODO use this in other functions
  _elementTemplate(vm) {
    const elementClass = this._ElementClassInstance(vm);
    // return if there is no template method
    if (!elementClass[this.templateMethodName]) return '';
    return elementClass[this.templateMethodName]();
  }
};

function toCamelCase(value) {
  return value.replace(hyphenCaseReg, m => m[1].toUpperCase());
}
