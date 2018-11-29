const { html } = require('common-tags');

module.exports = ({ body, title }) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>${title}</title>
      <meta http-equiv="Cache-Control" content="no-store" />
      <link rel="stylesheet" href="/assets/main.css">
      <script>
        // placeholder method for html template literals
        // TODO add script to package
        window.html = function (strings, ...expressionValues) {
          let finalString = '';
          let i = 0;
          let length = strings.length;
          for(; i < length; i++) {
            if (i > 0) finalString += expressionValues[i - 1];
            finalString += strings[i];
          }
          return finalString;
        };
      </script>
    </head>

    <body style="margin: 0;">
      ${body}
    </body>
  </html>
`;
