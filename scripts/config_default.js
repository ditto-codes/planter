#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import { planterSchema } from "../lib/utils.js";

export const defaultConfig = {
  planters: { 
    ...planterSchema('basic', {
      location: 'https://github.com/matthew-ia/planter-basic',
      position: 1,
      added: '2022-07-12-20:15:58-04',
    }), 
    ...planterSchema('svelte', { 
      location: 'https://github.com/matthew-ia/planter-svelte',
      position: 2,
      added: '2022-07-12-20:15:59-04',
    }),
  }, 
}

fs.outputJSONSync(path.resolve('./.planter/config.json'), defaultConfig, { spaces: 2 });
