#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import { planterSchema } from "../lib/utils.js";

export const defaultConfig = {
  planters: { }, 
}

fs.outputJSONSync(path.resolve('./.planter/config.json'), defaultConfig, { spaces: 2 });
