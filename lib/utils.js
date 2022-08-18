import Planter from './planter.js';
import fs from 'fs-extra';

export function updateUserConfig(config) {
  const {
    Config: userConfig,
    path: configPath,
  } = config;

  fs.outputJsonSync(configPath, userConfig, { spaces: 2 });
}

export function planterSchema(name = 'planter_name', props = {}) {
  const {
    location = 'repo_name'
  } = props;

  return {
    [name]: Object.assign(new Planter(name, { location, ...props }), {})
  };
}

export function planterExists(planter, errorCaller, name) {
  const isPlanter = !!planter;
  if (!isPlanter && errorCaller) {
    if (name) {
      errorCaller(`Planter ${Planter.print.name(name)} does not exist`);
    } else {
      errorCaller('Planter does not exist');
    }
  }
  return isPlanter;
}