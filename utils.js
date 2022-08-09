const packageJson = require('./package.json');
const compJson = require('./component.json');

exports.getUserAgent = () => {
  const { name: compName } = packageJson;
  const { version: compVersion } = compJson;
  const maesterClientVersion = packageJson.dependencies['@elastic.io/maester-client'];
  return `${compName}/${compVersion} maester-client/${maesterClientVersion}`;
};
