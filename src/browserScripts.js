const { includeComponentTemplatess, includeComponentScripts, includeComponents } = require('./componentRegistry')

exports.includeComponentTemplatess = includeComponentTemplatess;
exports.includeComponentScripts = includeComponentScripts;
exports.includeComponents = includeComponents;
exports.include = () => {
  return `
    <script>
      window.html = function (strings, ...expressionValues) {
        let finalString = '';
        let i = 0;
        let length = strings.length;
        for(; i < length; i++) {
          if (i > 0) finalString += expressionValues[i - 1];
          finalString += strings[i];
        }
        return finalString;
      };
    </script>
  `;
};
