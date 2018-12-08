/*
 * Component Registry
 * Allow components to be registered so we can serve them to the brower
 */

// TODO add webpack plugin method

const config = require('./config');
const { memoize } = require('./cache');
const components = {};


// --- create raw and memoized methods for building components ---

const memoized_includeComponentTemplates = memoize(includeComponentTemplates);
const memoized_includeComponentScripts = memoize(includeComponentScripts);
const memoized_includeComponents = memoize(includeComponents);

function includeComponentTemplates() {
  return Object.keys(components).map(key => components[key].getTemplateElementAsString()).join('\n');
}

function includeComponentScripts(hasTemplate) {
  return `
    <script>
      ${Object.keys(components).map(key => components[key].getClassAsString(hasTemplate)).join('\n')}
    </script>
  `;
}

function includeComponents() {
  const template = exports.includeComponentTemplates();
  return `${template}\n${exports.includeComponentScripts(!!template)}`;
}


// --- These mothods are meant to be used in building your layout template ---

exports.includeComponentTemplates = () => config.get('memoize') ? memoized_includeComponentTemplates() : includeComponentTemplates();
exports.includeComponentScripts = () => config.get('memoize') ? memoized_includeComponentScripts() : includeComponentScripts();
exports.includeComponents = () => config.get('memoize') ? memoized_includeComponents() : includeComponents();

// Method for registering components
// This should not be used for pages
exports.registerComponent = (component) => {
  if (components[component.name]) throw Error(`component "${component.name}" has already been registered. Please change the components name`);
  components[component.name] = component;
};

// NOTE are these needed?
// exports.getComponent = (name) => components[name];
// exports.getAllComponents = () => Object.assign({}, components);
