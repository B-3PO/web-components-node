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
  }

  async get() {
    return element() + '\n' + await script();
  }

  element() {
    return `<${this.name}></${this.name}>`;
  }

  async script() {
    return `<script>customElements.define("${this.name}",` + this.constructorString() + ');</script>';
  }

  async constructorString(serverRender = true) {
    let str = c.toString();
    let newContructor;
    str = str.replace('constructor(', 'constructor_original(').replace('super()', '');
    if (serverRender) {
      const nc = new c();
      if (nc.serverRender) newContructor = buildNewConstructor(await nc.serverRender());
    }
    if (!newContructor) newContructor = buildNewConstructor();

    str.splice(str.indexOf('{'), 0, newContructor);
  }
};


function buildNewConstructor(serverRenderTemplate) {
  return `\n
    constructor() {
      super();
      constructor_original();
      ${hasServerRender ? `serverRenderInject(${serverRenderTemplate});` : ''}
    }
  \n\n`;
}
