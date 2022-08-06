#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import { planterSchema } from "../lib/utils.js";
import { defaultConfig } from './config_default.js';

const config = {
  planters: { 
    ...defaultConfig.planters,
    ...planterSchema('howdy', {
      location: 'repo-howdy',
    }),
    ...planterSchema('cowboy', {
      location: '/path/to/cowboy',
      type: 'directory'
    })
  }, 
}

fs.outputJSONSync(path.resolve('./.planter/config.json'), config, { spaces: 2 });
