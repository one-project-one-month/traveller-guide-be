import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OpenAPIBuilder {
    constructor() {
        this.swaggerDir = path.join(__dirname, '..', 'swagger');
        this.outputFile = path.join(this.swaggerDir, 'openapi.yaml');
        this.baseSpec = null;
    }

    /**
     * Load and parse YAML file
     */
    loadYamlFile(filePath) {
        try {
            const fullPath = path.resolve(filePath);
            console.log(`Loading: ${fullPath}`);

            if (!fs.existsSync(fullPath)) {
                console.warn(`⚠️  File not found: ${fullPath}`);
                return {};
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            return yaml.load(content) || {};
        } catch (error) {
            console.error(`❌ Error loading ${filePath}:`, error.message);
            return {};
        }
    }

    /**
     * Load base specification
     */
    loadBaseSpec() {
        console.log('📋 Loading base specification...');
        this.baseSpec = this.loadYamlFile(
            path.join(this.swaggerDir, 'base.yaml')
        );

        if (!this.baseSpec.openapi) {
            throw new Error('Invalid base.yaml: Missing openapi version');
        }

        console.log(
            `✅ Base spec loaded: ${this.baseSpec.info?.title || 'Unknown'} v${
                this.baseSpec.info?.version || 'Unknown'
            }`
        );
    }

    /**
     * Load schemas from schemas directory
     */
    loadSchemas() {
        console.log('📚 Loading schemas...');
        const schemasDir = path.join(this.swaggerDir, 'components/schemas');

        if (!fs.existsSync(schemasDir)) {
            console.log('📁 Creating schemas directory...');
            fs.mkdirSync(schemasDir, { recursive: true });
            return {};
        }

        const schemaFiles = fs
            .readdirSync(schemasDir)
            .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'));

        const allSchemas = {};

        for (const file of schemaFiles) {
            console.log(`  📄 Loading schema file: ${file}`);
            const schemas = this.loadYamlFile(path.join(schemasDir, file));

            // Merge schemas
            Object.assign(allSchemas, schemas);
        }

        console.log(`✅ Loaded ${Object.keys(allSchemas).length} schemas`);
        return allSchemas;
    }

    /**
     * Load paths from paths directory
     */
    loadPaths() {
        console.log('🛤️  Loading paths...');
        const pathsDir = path.join(this.swaggerDir, 'paths');

        if (!fs.existsSync(pathsDir)) {
            console.log('📁 Creating paths directory...');
            fs.mkdirSync(pathsDir, { recursive: true });
            return {};
        }

        const pathFiles = fs
            .readdirSync(pathsDir)
            .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'));

        const allPaths = {};

        for (const file of pathFiles) {
            console.log(`  🛤️  Loading path file: ${file}`);
            const paths = this.loadYamlFile(path.join(pathsDir, file));

            // Merge paths
            Object.assign(allPaths, paths);
        }

        console.log(
            `✅ Loaded ${Object.keys(allPaths).length} path definitions`
        );
        return allPaths;
    }

    /**
     * Merge all specifications
     */
    mergeSpecs() {
        console.log('🔧 Merging specifications...');

        const schemas = this.loadSchemas();
        const paths = this.loadPaths();

        // Create the final specification
        const finalSpec = {
            ...this.baseSpec,
            paths: paths,
            components: {
                ...this.baseSpec.components,
                schemas: {
                    ...this.baseSpec.components?.schemas,
                    ...schemas,
                },
            },
        };

        console.log(finalSpec, 'finallllll');

        return finalSpec;
    }

    /**
     * Write the combined specification
     */
    writeOutput(spec) {
        console.log('💾 Writing combined specification...');

        try {
            const yamlOutput = yaml.dump(spec, {
                lineWidth: 120,
                noRefs: true,
                indent: 2,
            });

            fs.writeFileSync(this.outputFile, yamlOutput);
            console.log(
                `✅ OpenAPI specification written to: ${this.outputFile}`
            );
        } catch (error) {
            console.error('❌ Error writing output file:', error.message);
            throw error;
        }
    }

    /**
     * Validate the final specification
     */
    validate(spec) {
        console.log('🔍 Validating specification...');

        const errors = [];

        // Basic validation
        if (!spec.openapi) errors.push('Missing openapi version');
        if (!spec.info) errors.push('Missing info section');
        if (!spec.info?.title) errors.push('Missing API title');
        if (!spec.info?.version) errors.push('Missing API version');

        // Check paths
        const pathCount = Object.keys(spec.paths || {}).length;
        if (pathCount === 0) {
            console.warn('⚠️  No paths defined in specification');
        } else {
            console.log(`📊 Found ${pathCount} API endpoints`);
        }

        // Check schemas
        const schemaCount = Object.keys(spec.components?.schemas || {}).length;
        if (schemaCount === 0) {
            console.warn('⚠️  No schemas defined in specification');
        } else {
            console.log(`📊 Found ${schemaCount} schema definitions`);
        }

        if (errors.length > 0) {
            console.error('❌ Validation errors:');
            errors.forEach((error) => console.error(`  - ${error}`));
            throw new Error('Specification validation failed');
        }

        console.log('✅ Specification validation passed');
    }

    /**
     * Build the complete OpenAPI specification
     */
    build() {
        console.log('🚀 Starting OpenAPI documentation build...\n');

        try {
            // Load base specification
            this.loadBaseSpec();

            // Merge all components
            const finalSpec = this.mergeSpecs();

            // Validate the result
            this.validate(finalSpec);

            // Write output
            this.writeOutput(finalSpec);

            console.log(
                '\n🎉 OpenAPI documentation build completed successfully!'
            );
            console.log(`📖 View your docs at: http://localhost:4000/api-docs`);
        } catch (error) {
            console.error('\n💥 Build failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the builder
if (import.meta.url === `file://${process.argv[1]}`) {
    const builder = new OpenAPIBuilder();
    builder.build();
}

export default OpenAPIBuilder;
