const path = require('path');
const glob = require('glob');

const resolverFileGlob = '**/*.js';
const CWD = process.cwd();
const slash_REG = /\/$/;

module.exports = class PageMapper {
  constructor(uri, ignore = []) {
    const resolverFiles = path.join(uri, resolverFileGlob);
    const jsFiles = glob.sync(resolverFiles, { ignore: ignore }) || [];
    this.modules = jsFiles.reduce((a, f) => {
      const convertedURL = convertToUrl(f, uri);
      a[convertedURL] = require(path.join(CWD, f));
      if (convertedURL.includes('404')) this._404 = a[convertedURL];
      return a;
    }, {});
  }

  findPage(url) {
    return this.modules[url.replace(slash_REG, '')] || this._404 || noop;
  }

  set 404(url) {
    this._404 = this.modules[url.replace(slash_REG, '')];
  }
};

function convertToUrl(str, uri) {
  return str
    .replace(uri, '') // remove folder path
    .replace('index.js', '') // do not use index.js. insterad use folder
    .replace('.js', '') //js extension
    .replace(slash_REG, ''); // trailing slash
}

function noop() {
  return {};
}