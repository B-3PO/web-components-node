const { html } = require('../../index');

module.exports = ({ title }) => html`
  <header>
    <div>
      <b>\`web-components-node\`</b> example - ${title}
    </div>
  </header>
`;
