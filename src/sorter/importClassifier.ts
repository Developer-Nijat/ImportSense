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
    'next/font/local',
    'next/app',
    'next/document',
    'next/server'
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
    '.avif',
    '.ico',
    '.bmp',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.otf',
    '.mp4',
    '.webm',
    '.ogg',
    '.mp3',
    '.wav',
    '.module.css',
    '.module.scss',
    '.module.sass',
    '.module.less'
];

const COMPONENT_PATTERNS = [
    '/components/',
    '/components',
    '/component/',
    '/pages/',
    '/views/',
    '/layouts/',
    '/screens/'
];

const UTILS_PATTERNS = [
    '/utils/',
    '/utils',
    '/util/',
    '/helpers/',
    '/helpers',
    '/helper/',
    '/hooks/',
    '/hooks',
    '/lib/',
    '/lib'
];

const CONSTANTS_TYPES_PATTERNS = [
    '/constants/',
    '/constants',
    '/constant/',
    '/types/',
    '/types',
    '/type/',
    '/enums/',
    '/enum/',
    '/interfaces/',
    '/models/',
    '/model/',
    '.types',
    '.d.ts',
    '.constants',
    '.enum',
    'shared/constants',
    'shared/types',
    'shared/enums'
];

const SERVICE_PATTERNS = [
    '/services/',
    '/service/',
    '/api/',
    '/providers/',
    '/provider/',
    '/shared/',
    '/config/',
    '/store/',
    '/redux/',
    '/context/',
    '/middleware/'
];

export function classifyImport(
    source: string,
    context: ProjectContext,
    isSideEffect: boolean,
    _isTypeOnly: boolean
): ImportGroup {
    if (isSideEffect && !hasAssetExtension(source)) {
        return ImportGroup.SIDE_EFFECTS;
    }

    if (hasAssetExtension(source)) {
        return ImportGroup.ASSETS_STYLES;
    }

    if (isCoreModule(source, context)) {
        return ImportGroup.CORE;
    }

    if (isNodeBuiltin(source)) {
        return ImportGroup.CORE;
    }

    // Must check scoped npm packages BEFORE alias check
    if (isScopedNpmPackage(source)) {
        return ImportGroup.THIRD_PARTY;
    }

    if (isRelativePath(source)) {
        return classifyByPathSemantics(source);
    }

    if (isProjectAlias(source, context)) {
        return classifyByPathSemantics(source);
    }

    return ImportGroup.THIRD_PARTY;
}

function isCoreModule(source: string, context: ProjectContext): boolean {
    if (CORE_MODULES.has(source)) {
        return true;
    }

    if (source.startsWith('next/')) {
        return true;
    }

    if (context.framework === 'react' || context.framework === 'next') {
        if (source === 'react' || source.startsWith('react/') ||
            source === 'react-dom' || source.startsWith('react-dom/')) {
            return true;
        }
    }

    return false;
}

function isNodeBuiltin(source: string): boolean {
    if (source.startsWith('node:')) {
        return true;
    }
    return BUILTIN_MODULES.has(source);
}

const BUILTIN_MODULES = new Set([
    'assert', 'assert/strict', 'async_hooks',
    'buffer', 'child_process', 'cluster', 'console', 'constants',
    'crypto', 'dgram', 'diagnostics_channel', 'dns', 'dns/promises',
    'domain', 'events', 'fs', 'fs/promises', 'http', 'http2', 'https',
    'inspector', 'module', 'net', 'os', 'path', 'path/posix', 'path/win32',
    'perf_hooks', 'process', 'punycode', 'querystring', 'readline',
    'readline/promises', 'repl', 'stream', 'stream/consumers', 'stream/promises',
    'stream/web', 'string_decoder', 'sys', 'test', 'timers', 'timers/promises',
    'tls', 'trace_events', 'tty', 'url', 'util', 'util/types',
    'v8', 'vm', 'wasi', 'worker_threads', 'zlib'
]);

function isRelativePath(source: string): boolean {
    return source.startsWith('./') || source.startsWith('../');
}

function isScopedNpmPackage(source: string): boolean {
    if (!source.startsWith('@')) {
        return false;
    }

    // @/ and ~/ are always project aliases, not npm packages
    if (source.startsWith('@/') || source.startsWith('~/')) {
        return false;
    }

    // Scoped npm packages follow pattern: @scope/package (e.g., @material-ui/core)
    // The scope name doesn't contain slashes
    return /^@[^/]+\//.test(source);
}

function isProjectAlias(source: string, context: ProjectContext): boolean {
    // Explicit project alias patterns
    if (source.startsWith('@/') || source.startsWith('~/')) {
        return true;
    }

    // Scoped npm packages are NOT project aliases (already handled above, but be safe)
    if (isScopedNpmPackage(source)) {
        return false;
    }

    // Check against tsconfig/jsconfig configured aliases
    for (const alias of context.aliases.keys()) {
        const normalizedAlias = alias.replace(/\/?\*$/, '');

        if (normalizedAlias.length === 0) {
            continue;
        }

        // For aliases like "app/*", check if source starts with "app/"
        if (source === normalizedAlias || source.startsWith(normalizedAlias + '/')) {
            return true;
        }
    }

    return false;
}

function hasAssetExtension(source: string): boolean {
    const lowerSource = source.toLowerCase();
    return ASSET_EXTENSIONS.some(ext => lowerSource.endsWith(ext));
}

function classifyByPathSemantics(source: string): ImportGroup {
    const lowerSource = source.toLowerCase();

    // Check components first
    if (matchesAnyPattern(lowerSource, COMPONENT_PATTERNS)) {
        return ImportGroup.COMPONENTS;
    }

    // Check constants/types — before utils to avoid false negatives
    if (matchesAnyPattern(lowerSource, CONSTANTS_TYPES_PATTERNS)) {
        return ImportGroup.CONSTANTS_TYPES;
    }

    // Check utils/helpers/hooks
    if (matchesAnyPattern(lowerSource, UTILS_PATTERNS)) {
        return ImportGroup.UTILS;
    }

    // Check services/api/shared
    if (matchesAnyPattern(lowerSource, SERVICE_PATTERNS)) {
        return ImportGroup.INTERNAL;
    }

    return ImportGroup.INTERNAL;
}

function matchesAnyPattern(source: string, patterns: string[]): boolean {
    return patterns.some(pattern => source.includes(pattern));
}
