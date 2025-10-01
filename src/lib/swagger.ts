import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { JsonObject } from 'swagger-ui-express';

const yamlFilePath = path.join(process.cwd(), 'swagger', 'openapi.yaml');
const yamlFile = fs.readFileSync(yamlFilePath, 'utf8');

export const specs = yaml.load(yamlFile) as JsonObject;
