const { ObjectStorage } = require('@elastic.io/maester-client');
const Encryptor = require('elasticio-sailor-nodejs/lib/encryptor');
const packageJson = require('../package.json');
const compJson = require('../component.json');

const JWTToken = process.env.ELASTICIO_OBJECT_STORAGE_TOKEN;
const maesterUri = process.env.ELASTICIO_OBJECT_STORAGE_URI;
const PASSWORD = process.env.ELASTICIO_MESSAGE_CRYPTO_PASSWORD;
const VECTOR = process.env.ELASTICIO_MESSAGE_CRYPTO_IV;

const getUserAgent = (libName) => {
  const { name: compName } = packageJson;
  const { version: compVersion } = compJson;
  const libVersion = packageJson.dependencies[`@elastic.io/${libName}`];
  return `${compName}/${compVersion} ${libName}/${libVersion}`;
};

const getObjectStorage = () => {
  const objectStorage = new ObjectStorage({
    uri: maesterUri,
    jwtSecret: JWTToken,
    userAgent: getUserAgent('maester-client')
  });

  const encryptor = new Encryptor(PASSWORD, VECTOR);
  objectStorage.use(
    () => encryptor.createCipher(),
    () => encryptor.createDecipher()
  );
  return objectStorage;
};

const logAndThrowError = (logger, errMsg) => {
  logger.error(errMsg);
  throw new Error(errMsg);
};

const isNumberNaN = (num) => Number(num).toString() === 'NaN';

module.exports.getUserAgent = getUserAgent;
module.exports.getObjectStorage = getObjectStorage;
module.exports.isNumberNaN = isNumberNaN;
module.exports.logAndThrowError = logAndThrowError;
