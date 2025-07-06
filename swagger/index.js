const path = require('path');
const YAML = require('yamljs');

const swaggerDocument = YAML.load(path.join(__dirname, 'bundled.yaml'));
module.exports = swaggerDocument;
