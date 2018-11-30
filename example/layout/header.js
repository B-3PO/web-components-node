const { html } = require('../../index');

module.exports = ({ title }) => html`
  <header>
    <div>
      <b>\`customElementsNode\`</b> example - ${title}
    </div>
  </header>
`;
