// vite-plugin-replace-imports.ts
import type { Plugin } from 'vite';

export function replaceNamedImportsFromGlobals(options: Record<string, string[]>): Plugin {
  return {
    name: 'replace-named-imports-from-globals',
    enforce: 'pre', // ✅ 类型推断正确
    transform(code, id) {
      if (!id.endsWith('.ts') && !id.endsWith('.vue')) return;

      let transformed = code;
      let modified = false;

      for (const [moduleName, symbols] of Object.entries(options)) {
        const importRegex = new RegExp(
          `import\\s*\\{([^}]*?)\\}\\s*from\\s*['"]${moduleName}['"];?`,
          'g'
        );

        transformed = transformed.replace(importRegex, (_, imports) => {
          const names = imports.split(',').map((s:string) => s.trim()).filter(Boolean);
          const replacements = names
            .filter((name:string) => symbols.includes(name))
            .map((name:string) => `const ${name} = (window as any).${name};`)
            .join('\n');

          modified = true;
          return replacements;
        });
      }

      if (modified) {
        return {
          code: transformed,
          map: null,
        };
      }

      return null;
    },
  };
}
