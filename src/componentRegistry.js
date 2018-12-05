const components = {};

exports.getComponent = (name) => components[name];
exports.getAllComponents = () => Object.assign({}, components);
exports.includeComponentTemplatess = () => Object.keys(components).map(key => components[key].getTemplateElementAsString()).join('\n');
exports.includeComponentScripts = () => `
  <script>
    ${Object.keys(components).map(key => components[key].getClassAsString(true)).join('\n')}
  </script>
`;
exports.includeComponents = () => `${exports.includeComponentTemplatess()}\n${exports.includeComponentScripts()}`;

exports.registerComponent = (component) => {
  if (components[component.name]) throw Error(`component "${component.name}" has already been registered. Please change the components name`);
  components[component.name] = component;
};
