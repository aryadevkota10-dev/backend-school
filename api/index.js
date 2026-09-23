const { app, init } = require('../server');

module.exports = async function handler(req, res) {
  await init();
  return app(req, res);
};
