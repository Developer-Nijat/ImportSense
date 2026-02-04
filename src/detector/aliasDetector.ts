import * as fs from 'fs';
import * as path from 'path';

interface TsConfig {
    compilerOptions?: {
        paths?: Record<string, string[]>;
        baseUrl?: string;
    };
    extends?: string;
}

export function detectAliases(workspaceRoot: string): Map<string, string> {
    const aliases = new Map<string, string>();
    
    const tsconfigPath = findTsConfig(workspaceRoot);
    if (!tsconfigPath) {
        return getDefaultAliases();
    }

    try {
        const config = readTsConfig(tsconfigPath, workspaceRoot);
        const paths = config.compilerOptions?.paths;
        
        if (paths) {
            for (const [alias, targets] of Object.entries(paths)) {
                if (targets && targets.length > 0) {
                    aliases.set(alias, targets[0]);
                }
            }
        }
    } catch {
        return getDefaultAliases();
    }

    if (aliases.size === 0) {
        return getDefaultAliases();
    }

    return aliases;
}

function findTsConfig(workspaceRoot: string): string | null {
    const configNames = ['tsconfig.json', 'jsconfig.json'];
    
    for (const configName of configNames) {
        const configPath = path.join(workspaceRoot, configName);
        if (fs.existsSync(configPath)) {
            return configPath;
        }
    }
    
    return null;
}

function readTsConfig(configPath: string, workspaceRoot: string): TsConfig {
    const content = fs.readFileSync(configPath, 'utf-8');
    const cleanedContent = removeJsonComments(content);
    const config: TsConfig = JSON.parse(cleanedContent);
    
    if (config.extends) {
        const extendedPath = resolveExtendedConfig(config.extends, configPath, workspaceRoot);
        if (extendedPath && fs.existsSync(extendedPath)) {
            const extendedConfig = readTsConfig(extendedPath, workspaceRoot);
            return mergeConfigs(extendedConfig, config);
        }
    }
    
    return config;
}

function removeJsonComments(json: string): string {
    return json
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/,(\s*[}\]])/g, '$1');
}

function resolveExtendedConfig(
    extendsPath: string, 
    currentConfigPath: string,
    workspaceRoot: string
): string | null {
    if (extendsPath.startsWith('.')) {
        return path.resolve(path.dirname(currentConfigPath), extendsPath);
    }
    
    const nodeModulesPath = path.join(workspaceRoot, 'node_modules', extendsPath);
    if (fs.existsSync(nodeModulesPath)) {
        return nodeModulesPath;
    }
    
    if (!extendsPath.endsWith('.json')) {
        const withJson = nodeModulesPath + '.json';
        if (fs.existsSync(withJson)) {
            return withJson;
        }
    }
    
    return null;
}

function mergeConfigs(base: TsConfig, override: TsConfig): TsConfig {
    return {
        ...base,
        ...override,
        compilerOptions: {
            ...base.compilerOptions,
            ...override.compilerOptions,
            paths: {
                ...base.compilerOptions?.paths,
                ...override.compilerOptions?.paths
            }
        }
    };
}

function getDefaultAliases(): Map<string, string> {
    const defaults = new Map<string, string>();
    defaults.set('@/*', './src/*');
    defaults.set('~/*', './src/*');
    return defaults;
}
