const packageJson = require('./package.json');
const compJson = require('./component.json');

exports.getUserAgent = (libName) => {
  const { name: compName } = packageJson;
  const { version: compVersion } = compJson;
  const libVersion = packageJson.dependencies[`@elastic.io/${libName}`];
  return `${compName}/${compVersion} ${libName}/${libVersion}`;
};
