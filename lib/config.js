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
  const userFolderExists = fs.pathExistsSync(userFolderPath);
  const configExists = fs.pathExistsSync(path.join(userFolderPath, '/config.json'));

  if (!userFolderExists) {
    createUserFolder(userFolderPath);
  } else if (userFolderExists && !configExists) {
    createUserConfig(userFolderPath);
  }

  return await readUserConfig(userFolderPath);
}