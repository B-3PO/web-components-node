const config = {
  templateMethod: 'template'
};

exports.set = (params = {}) => {
  Object.keys(config).forEach(key => {
    if (params[key] !== undefined) config[key] = params[key];
  });
};

exports.get = () => config;
