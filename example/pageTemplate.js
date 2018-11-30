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
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      ${browserScripts.include()}
    </head>

    <body>
      ${body}
    </body>
  </html>
`;
