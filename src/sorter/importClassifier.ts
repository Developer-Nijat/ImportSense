import { ImportGroup, ProjectContext } from '../types';

const CORE_MODULES = new Set([
    'react',
    'react-dom',
    'react-dom/client',
    'react-dom/server',
    'next',
    'next/head',
    'next/link',
    'next/image',
    'next/router',
    'next/navigation',
    'next/script',
    'next/dynamic',
    'next/font',
    'next/font/google',
    'next/font/local'
]);

const ASSET_EXTENSIONS = [
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.styl',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.otf',
    '.module.css',
    '.module.scss'
];

export function classifyImport(
    source: string,
    context: ProjectContext,
    isSideEffect: boolean,
    isTypeOnly: boolean
): ImportGroup {
    if (isSideEffect && !hasAssetExtension(source)) {
        return ImportGroup.SIDE_EFFECTS;
    }

    if (hasAssetExtension(source)) {
        return ImportGroup.ASSETS_STYLES;
    }

    if (isCoreModule(source)) {
        return ImportGroup.CORE;
    }

    if (isNodeBuiltin(source)) {
        return ImportGroup.CORE;
    }

    if (isRelativePath(source)) {
        return classifyRelativeImport(source);
    }

    if (isAliasedPath(source, context)) {
        return classifyAliasedImport(source);
    }

    return ImportGroup.THIRD_PARTY;
}

function isCoreModule(source: string): boolean {
    return CORE_MODULES.has(source) || source.startsWith('next/');
}

function isNodeBuiltin(source: string): boolean {
    return source.startsWith('node:') || isBuiltinModule(source);
}

function isBuiltinModule(source: string): boolean {
    const builtins = new Set([
        'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants',
        'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https',
        'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode',
        'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'sys',
        'timers', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib'
    ]);
    return builtins.has(source);
}

function isRelativePath(source: string): boolean {
    return source.startsWith('./') || source.startsWith('../');
}

function isAliasedPath(source: string, context: ProjectContext): boolean {
    if (source.startsWith('@/') || source.startsWith('~/')) {
        return true;
    }
    
    for (const alias of context.aliases.keys()) {
        const normalizedAlias = alias.replace('/*', '');
        if (source.startsWith(normalizedAlias)) {
            return true;
        }
    }
    
    return false;
}

function hasAssetExtension(source: string): boolean {
    const lowerSource = source.toLowerCase();
    return ASSET_EXTENSIONS.some(ext => lowerSource.endsWith(ext));
}

function classifyRelativeImport(source: string): ImportGroup {
    const lowerSource = source.toLowerCase();
    
    if (lowerSource.includes('/components/') || lowerSource.includes('/component')) {
        return ImportGroup.COMPONENTS;
    }
    
    if (lowerSource.includes('/utils/') || lowerSource.includes('/util/') || 
        lowerSource.includes('/helpers/') || lowerSource.includes('/helper')) {
        return ImportGroup.UTILS;
    }
    
    if (lowerSource.includes('/constants/') || lowerSource.includes('/constant') ||
        lowerSource.includes('/types/') || lowerSource.includes('/type') ||
        lowerSource.includes('.types') || lowerSource.includes('.d.ts')) {
        return ImportGroup.CONSTANTS_TYPES;
    }
    
    return ImportGroup.INTERNAL;
}

function classifyAliasedImport(source: string): ImportGroup {
    const lowerSource = source.toLowerCase();
    
    if (lowerSource.startsWith('@/components') || lowerSource.startsWith('~/components')) {
        return ImportGroup.COMPONENTS;
    }
    
    if (lowerSource.startsWith('@/utils') || lowerSource.startsWith('~/utils') ||
        lowerSource.startsWith('@/helpers') || lowerSource.startsWith('~/helpers')) {
        return ImportGroup.UTILS;
    }
    
    if (lowerSource.startsWith('@/constants') || lowerSource.startsWith('~/constants') ||
        lowerSource.startsWith('@/types') || lowerSource.startsWith('~/types')) {
        return ImportGroup.CONSTANTS_TYPES;
    }
    
    return ImportGroup.INTERNAL;
}
