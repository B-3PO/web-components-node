/*
 * Component Registry
 * Allow components to be registered so we can serve them to the brower
 */

const components = {};

function includeComponentTemplates() {
  return Object.keys(components).map(key => components[key].getTemplateElementAsString()).join('\n');
}

function includeComponentScripts() {
  return `
    <script>
      ${Object.keys(components).map(key => {
        return components[key].getClassAsString()
      }).join('\n')}
    </script>
  `;
}

exports.includeComponents = () => {
  return `${includeComponentTemplates()}\n${includeComponentScripts()}`;
};

exports.staticFile = () => `
document.addEventListener("DOMContentLoaded", function (event) {
  ${Object
    .keys(components)
    .map(key => components[key].getTemplateElementAsIIFE())
    .join('\n')}

  ${Object
    .keys(components)
    .map(key => components[key].getClassAsString())
    .join('\n')}
});
`;

exports.staticComponentCSS = () => Object
  .keys(components)
  .map(key => components[key].getExternalCSS())
  .join('\n');

// Method for registering components
// This should not be used for pages
exports.registerComponent = (component) => {
  if (components[component.name]) throw Error(`component "${component.name}" has already been registered. Please change the components name`);
  components[component.name] = component;
};
