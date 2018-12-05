// Global Configuration

const config = {
  /*
   * default: 'template'
   * The default method name for templates used by the template renderer
   */
  templateMethod: 'template',

  /*
   * This will memoize certain methods to prevent unnecessary processing
   * This is essantially equal to static file performance after the first request
   */
  memoize: true,

  /*
   * default: true
   * This will minify the js in component script tags and the component tmeplate html
   * This can help redice file size
   */
  minify: true
};

exports.get = (name) => name !== undefined ? config[name] : config;
exports.set = (params = {}) => {
  Object.keys(config).forEach(key => {
    if (params[key] !== undefined) config[key] = params[key];
  });
};
