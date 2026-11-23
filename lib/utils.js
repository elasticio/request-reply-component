const { ObjectStorage } = require('@elastic.io/maester-client');
const crypto = require('crypto');
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

  // aes-256-cbc, key = sha256(password); matches elasticio-sailor-nodejs Encryptor
  const key = crypto.createHash('sha256').update(PASSWORD, 'utf-8').digest();
  objectStorage.use(
    () => crypto.createCipheriv('aes-256-cbc', key, VECTOR),
    () => crypto.createDecipheriv('aes-256-cbc', key, VECTOR)
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
