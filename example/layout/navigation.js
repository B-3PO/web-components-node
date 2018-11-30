const { html } = require('../../index');

module.exports = ({ title }) => html`
  <nav>
    <a href="/home" ${title === 'Home' ? 'class="current"' : ''}>Home</a> |
    <a href="/list" ${title === 'List' ? 'class="current"' : ''}>List</a> |
    <a href="/listClientRender" ${title === 'List Client Render' ? 'class="current"' : ''}>List client render</a> |
    <a href="/interactive" ${title === 'Interactive' ? 'class="current"' : ''}>Interactive</a> |
    <a href="/404" ${title === '404' ? 'class="current"' : ''}>404</a>
  </nav>
`;
