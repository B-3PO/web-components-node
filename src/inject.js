const { memoize } = require('./cache');
const config = require('./config');
const { includeComponents } = require('./componentRegistry');
const includeComponentsMemoized = memoize(includeComponents);
const fs = require('fs');
const path = require('path');
const main = require('./client-files/main.js');
const serviceWorker = require('./client-files/service-worker-laoder.js');

const buildScriptsMemoize = memoize(buildScripts);
function buildScripts(params) {
  return `
<script>
  ${main(params)}
  ${config.get('serviceWorker') ? serviceWorker(params) : ''}
</script>
  `;
}

module.exports = {
  scripts(params = {}) {
    return config.get('memoize') ? buildScriptsMemoize(params) : buildScripts(params);
  },

  components() {
    return config.get('memoize') ? includeComponentsMemoized() : includeComponents();
  }
};
