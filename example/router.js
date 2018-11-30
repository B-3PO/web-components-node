const express = require('express');
const router = express.Router();
const layout = require('./layout');
const { PageMapper } = require('../index');
const pageMapper = new PageMapper('example/pages');
const { getList } = require('./services/list');
const { getStates } = require('./services/states');


// api router
router.get('/api/list', (_req, res) => {
  res.send({
    list: getList()
  });
});

router.get('/api/states', (_req, res) => {
  res.send({
    states: getStates()
  });
});

// Page route
router.get('/*', async (req, res) => {
  const { body, title } = await pageMapper.findPage(req.path)();
  res.send(layout({ body, title }));
});

module.exports = router;
