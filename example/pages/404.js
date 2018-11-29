const { html } = require('../../index');

module.exports = async () => ({
  title: '404',
  body: html`
    <h1>Page Not Found</h1>
    <p>Sorry, but the page you were trying to view does not exist.</p>
  `
});
