// lib/swagger.js
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { JsonObject } from 'swagger-ui-express';

// Update to use 'swagger' folder and 'index.yaml' file
const yamlFilePath = path.join(process.cwd(), 'swagger', 'openapi.yaml');
const yamlFile = fs.readFileSync(yamlFilePath, 'utf8');

export const specs = yaml.load(yamlFile) as JsonObject;
