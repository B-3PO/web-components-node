const {
  browserScripts,
  html
} = require('../index');

module.exports = ({ body, title }) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${title}</title>
      <meta http-equiv="Cache-Control" content="no-store" />
      <link rel="stylesheet" href="/assets/main.css">
      ${browserScripts.include()}
    </head>

    <body style="margin: 0;">
      ${body}
    </body>
  </html>
`;
