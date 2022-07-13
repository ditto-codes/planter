#!/usr/bin/env node

import { homedir } from 'os';
import fs from 'fs-extra';
import path from 'path';

const home = homedir();
const userFolderPath = path.join(home, '.planter');

fs.removeSync(userFolderPath);