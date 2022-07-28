import fs from 'fs-extra';

export function updateUserConfig([ userConfig, configPath ]) {
  fs.outputJsonSync(configPath, userConfig, { spaces: 2 });
}