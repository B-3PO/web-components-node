const config = require('./config');
const { memoize } = require('./cache');
const components = {};

const memoized_includeComponentTemplates = memoize(includeComponentTemplates);
function includeComponentTemplates() {
  return Object.keys(components).map(key => components[key].getTemplateElementAsString()).join('\n');
}

const memoized_includeComponentScripts = memoize(includeComponentScripts);
function includeComponentScripts() {
  return `
    <script>
      ${Object.keys(components).map(key => components[key].getClassAsString(true)).join('\n')}
    </script>
  `;
}

const memoized_includeComponents = memoize(includeComponents);
function includeComponents() {
  return `${exports.includeComponentTemplates()}\n${exports.includeComponentScripts()}`;
}

exports.getComponent = (name) => components[name];
exports.getAllComponents = () => Object.assign({}, components);

exports.includeComponentTemplates = () => config.get('memoize') ? memoized_includeComponentTemplates() : includeComponentTemplates();
exports.includeComponentScripts = () => config.get('memoize') ? memoized_includeComponentScripts() : includeComponentScripts();
exports.includeComponents = () => config.get('memoize') ? memoized_includeComponents() : includeComponents();

exports.registerComponent = (component) => {
  if (components[component.name]) throw Error(`component "${component.name}" has already been registered. Please change the components name`);
  components[component.name] = component;
};
