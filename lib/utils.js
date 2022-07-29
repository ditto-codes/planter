import fs from 'fs-extra';

export function updateUserConfig(config) {
  const {
    Config: userConfig,
    path: configPath,
  } = config;

  fs.outputJsonSync(configPath, userConfig, { spaces: 2 });
}