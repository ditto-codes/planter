import fs from 'fs-extra';

export function updateUserConfig([ userConfig, configPath ]) {
  // console.log(userConfig);
  fs.outputJsonSync(configPath, userConfig, { spaces: 2 });
}