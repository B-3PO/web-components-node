const uglifyJS = require('uglify-es');
const config = require('./config');
const { memoize } = require('./cache');
const {
  includeComponentTemplatess,
  includeComponentScripts,
  includeComponents
} = require('./componentRegistry')

const includeMemoize = memoize(include);
function include() {
  return `
    <script>
      ${uglifyJS.minify(`window.html = function (strings, ...expressionValues) {
        let finalString = '';
        let i = 0;
        let length = strings.length;
        for(; i < length; i++) {
          if (i > 0) finalString += expressionValues[i - 1];
          finalString += strings[i];
        }
        return finalString;
      }`).code};
    </script>
  `;
}

exports.includeComponentTemplatess = includeComponentTemplatess;
exports.includeComponentScripts = includeComponentScripts;
exports.includeComponents = includeComponents;
exports.include = () => config.get('memoize') ? includeMemoize() : include();
