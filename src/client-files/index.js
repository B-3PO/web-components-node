const files = {
  main: require('./main.js'),
  serviceWorkerLaoder: require('./service-worker-laoder'),
  serviceWorker: require('./service-worker')
};
const reg = /-([a-z])/g;

function toCamelCase(str) {
  return str.replace(reg, g => g[1].toUpperCase());
}

module.exports = params => {
  const cameled = toCamelCase(params.fileName.replace('.js', ''));
  if (!files[cameled]) throw Error('file not found');
  return files[cameled](params);
};
