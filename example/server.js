const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const app = express();
const { setConfig } = require('../index');
const PORT = process.env.PORT || 3001;

setConfig({
  templateMethod: 'template' // this is the default
});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/assets', express.static(__dirname));

app.use('/', require('./router'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500);
  res.send({ error: err.message });
});

app.listen(PORT, () => console.log(`Example app running on port ${PORT}`));

module.exports = app;
