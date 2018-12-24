module.exports = params => `
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('${params.host}/service-worker.js'})
      .then(function(registration) {
        console.log('Registration successful, scope is:', registration.scope);
      })
      .catch(function(error) {
        console.log('Service worker registration failed, error:', error);
      });
  }
`;
