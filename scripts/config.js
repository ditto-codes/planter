#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';

function planterSchema(planter) {
  const {
    name = 'planter_name',
    location = 'repo_name',
    type = 'remote',
    position = null,
    created = '2022-07-12-20:16:00-04',
  } = planter;

  // Note: the keys here are specific to what the CLI is expecting
  return {
    [name]: {
      _location: location,
      _type: type,
      _position: position,
      _created: created,
    }
  }
}

const defaultConfig = {
  planters: { 
    ...planterSchema({ 
      name: 'basic',
      location: 'https://github.com/matthew-ia/planter-basic',
      position: 1,
      created: '2022-07-12-20:15:58-04',
    }), 
    ...planterSchema({ 
      name: 'svelte',
      location: 'https://github.com/matthew-ia/planter-svelte',
      position: 2,
      created: '2022-07-12-20:15:59-04',
    })
  }, 
}

fs.outputJSONSync(path.resolve('./.planter/config.json'), defaultConfig, { spaces: 2 });
