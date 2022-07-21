import { homedir } from 'os';
import path from 'path';
import fs from 'fs-extra';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createUserFolder(userFolderPath) {
  const defaultUserFolderPath = path.join(__dirname, '../.planter');
  fs.copySync(defaultUserFolderPath, userFolderPath);
  logger.whisper(`Created new Planter user folder: ${userFolderPath}`);
}

function createUserConfig(userFolderPath) {
  const defaultUserConfigPath = path.join(__dirname, '../.planter/config.json');
  const userConfigPath = path.join(userFolderPath, 'config.json');
  fs.copySync(defaultUserConfigPath, userConfigPath);
  logger.whisper(`No user config found. Created new Planter config: ${userFolderPath}/config.json`);
}

function readUserConfig(userFolderPath) {
  let config = null;
  const userConfigPath = path.join(userFolderPath, 'config.json');

  try {
    config = fs.readJsonSync(userConfigPath);
  } catch (err) {
    throw logger.error(
      `Could not load user config`, 
      `Attemped to read JSON from: ${userConfigPath}`,
      true,
      err
    );
  }

  if (config) config.path = userConfigPath;
  return [config, userConfigPath];
}

function readDefaultConfig() {
  let config = null;
  const defaultUserConfigPath = path.join(__dirname, '../.planter/config.json');

  try {
    config = fs.readJsonSync(defaultUserConfigPath);
  } catch (err) {
    throw logger.error(
      `Could not load user config`, 
      `Attemped to read JSON from: ${defaultUserConfigPath}`,
      true,
      err
    );
  }

  return [config, defaultUserConfigPath];
}

export function loadConfig(createNew = false) {
  const home = homedir();
  const userFolderPath = path.join(home, '.planter');

  // Check for user folder and config file
  const userFolderExists = fs.pathExistsSync(userFolderPath);
  const configExists = fs.pathExistsSync(path.join(userFolderPath, '/config.json'));

  if (!userFolderExists) {
    if (!createNew) {
      return readDefaultConfig();
    }
    createUserFolder(userFolderPath);

  } else if (userFolderExists && !configExists) {
    if (!createNew) {
      return readDefaultConfig();
    }
    createUserConfig(userFolderPath);
  }

  return readUserConfig(userFolderPath);
}