const { memoize } = require('./cache');
const config = require('./config');
const { includeComponents } = require('./componentRegistry');
const includeComponentsMemoized = memoize(includeComponents);
const fs = require('fs');
const main = fs.readFileSync('public/main.js', 'utf8');
const serviceWorker = fs.readFileSync('public/service-worker-laoder.js', 'utf8');

const buildScriptsMemoize = memoize(buildScripts);
function buildScripts() {
  return `
<script>
  ${main}
  ${config.get('serviceWorker') ? serviceWorker : ''}
</script>
  `;
}

module.exports = {
  scripts() {
    return config.get('memoize') ? buildScriptsMemoize() : buildScripts();
  },

  components() {
    return config.get('memoize') ? includeComponentsMemoized() : includeComponents();
  }
};
