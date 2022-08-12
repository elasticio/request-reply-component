const packageJson = require('./package.json');
const compJson = require('./component.json');

exports.getUserAgent = (lib) => {
  const { name: compName } = packageJson;
  const { version: compVersion } = compJson;
  const libVersion = packageJson.dependencies['@elastic.io/maester-client'];
  return `${compName}/${compVersion} ${lib}/${libVersion}`;
};
