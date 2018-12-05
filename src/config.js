const config = {
  templateMethod: 'template',
  memoize: true,
  minify: true
};

exports.set = (params = {}) => {
  Object.keys(config).forEach(key => {
    if (params[key] !== undefined) config[key] = params[key];
  });
};

exports.get = (name) => name !== undefined ? config[name] : config;
