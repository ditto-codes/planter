import { homedir } from 'os';
import path from 'path';
import fs from 'fs-extra';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';
import Planter from './planter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createUserFolder(userFolderPath) {
  const defaultUserFolderPath = path.join(__dirname, '../.planter');
  fs.copySync(defaultUserFolderPath, userFolderPath);
  // logger.whisper(`Created new Planter user config at: ${userFolderPath}/config.json`);
}

function createUserConfig(userFolderPath) {
  const defaultUserConfigPath = path.join(__dirname, '../.planter/config.json');
  const userConfigPath = path.join(userFolderPath, 'config.json');
  fs.copySync(defaultUserConfigPath, userConfigPath);
  // logger.whisper(`Created new Planter user config at: ${userConfigPath}`);
}

function readUserConfig(userFolderPath, error) {
  let config = null;
  const userConfigPath = path.join(userFolderPath, 'config.json');

  try {
    config = fs.readJsonSync(userConfigPath);
    convertToPlanterClass(config.planters);
  } catch (err) {
    error(`Could not load user config.\nAttemped to read JSON from: ${userConfigPath}`);
  }

  return { Config: config, path: userConfigPath };
}

function readDefaultConfig() {
  let config = null;
  const defaultUserConfigPath = path.join(__dirname, '../.planter/config.json');
  config = fs.readJsonSync(defaultUserConfigPath);
  convertToPlanterClass(config.planters);

  return { Config: config, path: defaultUserConfigPath };
}

function convertToPlanterClass(planters) {
  for (let name in planters) {
    planters[name] = Object.assign(new Planter(name), planters[name]);
  }
}

export function loadConfig(error, requiresUserFolder = false) {
  const home = homedir();
  const userFolderPath = path.join(home, '.planter');

  // Check for user folder and config file
  const userFolderExists = fs.pathExistsSync(userFolderPath);
  const configExists = fs.pathExistsSync(path.join(userFolderPath, '/config.json'));

  if (!userFolderExists) {
    if (!requiresUserFolder) {
      return readDefaultConfig();
    }
    createUserFolder(userFolderPath);

  } else if (userFolderExists && !configExists) {
    if (!requiresUserFolder) {
      return readDefaultConfig();
    }
    createUserConfig(userFolderPath);
  }

  return readUserConfig(userFolderPath, error);
}