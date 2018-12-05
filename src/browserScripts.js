/*
 * browser scripts
 * This file contains all the scripts that you might want to send to the client
 * Nothing in the file is required
 */

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
      // This is iontended to make template literal html methods not break on the front end
      ${uglifyJS.minify(`window.html = function (strings, ...expressionValues) {
        let finalString = '';
        let i = 0;
        let length = strings.length;
        for(; i < length; i++) {
          if (i > 0) finalString += expressionValues[i - 1];
          finalString += strings[i];
        }
        return finalString;
      }; window.htmlSafe = window.html;`).code};
    </script>
  `;
}

exports.includeComponentTemplatess = includeComponentTemplatess;
exports.includeComponentScripts = includeComponentScripts;
exports.includeComponents = includeComponents;
exports.include = () => config.get('memoize') ? includeMemoize() : include();
