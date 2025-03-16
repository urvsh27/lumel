import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
// we can do based on mode but as of now i have set up the static
export const YAML_CONFIG_FILENAME = 'config.yml';

export const YAML_CONFIG = yaml.load(
  readFileSync(YAML_CONFIG_FILENAME, 'utf8'),
) as Record<string, any>;

export default () => {
  return YAML_CONFIG;
};

export const yaml_db_pg = 'database.pg';
const yaml_mode = 'mode';
const yaml_port = 'port';
export const yaml_db_core = 'database.db_core';

export const PORT = YAML_CONFIG[yaml_port];
export const MODE = YAML_CONFIG[yaml_mode];

// can set up uat and prod mode too here
export const IS_DEV = MODE === 'dev';
