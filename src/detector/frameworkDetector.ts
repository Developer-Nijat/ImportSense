import * as fs from 'fs';
import * as path from 'path';
import { ProjectContext } from '../types';

interface PackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

type Framework = ProjectContext['framework'];

export function detectFramework(workspaceRoot: string): Framework {
    const packageJsonPath = path.join(workspaceRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        return 'unknown';
    }

    try {
        const content = fs.readFileSync(packageJsonPath, 'utf-8');
        const packageJson: PackageJson = JSON.parse(content);
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        if ('next' in allDeps) {
            return 'next';
        }

        if ('react' in allDeps || 'react-dom' in allDeps) {
            return 'react';
        }

        if ('express' in allDeps || 'fastify' in allDeps || 'koa' in allDeps) {
            return 'node';
        }

        return 'node';
    } catch {
        return 'unknown';
    }
}
