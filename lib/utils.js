// 1. When CLI starts, check if user has a plante dotfolder with a config file
//    If yes, read the data
//    If no, then we need to create the planter dotfolder with the default config

// 2. Create the dotfolder at the user home

import { homedir } from 'os';
import path from 'path';
import fs from 'fs-extra';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createUserFolder(userFolderPath) {
  const defaultUserFolderPath = path.join(__dirname, '../.planter');
  fs.copySync(defaultUserFolderPath, userFolderPath);
}

function createUserConfig(userFolderPath) {
  const defaultUserConfigPath = path.join(__dirname, '../.planter/config.json');
  const userConfigPath = path.join(userFolderPath, 'config.json');
  fs.copySync(defaultUserConfigPath, userConfigPath);
}

export async function readUserConfig(userFolderPath) {
  let config = null;
  const userConfigPath = path.join(userFolderPath, 'config.json');

  try {
    config = await fs.readJson(userConfigPath)
    // console.log(config.planters) // => 2
  } catch (err) {
    // TODO: add more descriptive error message
    console.error(err);
  }

  return config;
}

export async function getUserConfig() {
  const home = homedir();
  const userFolderPath = path.join(home, '.planter');

  // Check for user folder and config file
  const planterDirExists = fs.pathExistsSync(userFolderPath);
  const configExists = fs.pathExistsSync(path.join(userFolderPath, '/config.json'));

  if (!planterDirExists) {
    createUserFolder(userFolderPath);
  } else if (planterDirExists && !configExists) {
    createUserConfig(userFolderPath);
  }

  return await readUserConfig(userFolderPath);
}