import fs from 'fs-extra';
import { format } from 'date-fns';
import Planter from './planter.js';

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