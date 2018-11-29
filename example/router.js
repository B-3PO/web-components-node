const express = require('express');
const router = express.Router();
const pageTemplate = require('./pageTemplate');
const { PageMapper } = require('../index');
const pageMapper = new PageMapper('example/pages');

// api router
router.get('/api/test', (req, res) => {

});

// Page route
router.get('/*', async (req, res) => {
  const { body, title } = await pageMapper.findPage(req.path)();
  res.send(pageTemplate({ body, title }));
});

module.exports = router;
