# Publishing to npm

## Pre-publish Checklist

✅ **Version Updated**: Package version set to 1.0.7
✅ **Build Configuration**: tsup configured for library builds
✅ **TypeScript Declarations**: Generated successfully
✅ **Exports Configured**: Main, module, and types exports set
✅ **Peer Dependencies**: React and React DOM moved to peerDependencies
✅ **Files Whitelist**: Only dist/, README.md, and LICENSE will be published
✅ **Changelog Updated**: CHANGELOG.md includes v1.0.7 changes
✅ **README Updated**: Includes installation instructions and examples

## Build Commands

```bash
# Build the library (this runs automatically before publish)
pnpm build:lib

# Test the build locally
npm pack
# This creates tantainnovative-ndpr-toolkit-1.0.7.tgz
```

## Publishing Steps

1. **Login to npm** (if not already logged in):
   ```bash
   npm login
   ```

2. **Publish to npm**:
   ```bash
   npm publish --access public
   ```

   Or if you want to do a dry run first:
   ```bash
   npm publish --dry-run --access public
   ```

3. **Tag the release in git**:
   ```bash
   git tag v1.0.7
   git push origin v1.0.7
   ```

## What Gets Published

The following files/folders will be included in the npm package:
- `dist/` - All built files (JS, MJS, and TypeScript declarations)
- `README.md` - Package documentation
- `LICENSE` - MIT license file
- `package.json` - Package metadata

## Package Structure

```
@tantainnovative/ndpr-toolkit@1.0.7
├── dist/
│   ├── index.js         # CommonJS entry
│   ├── index.mjs        # ESM entry
│   ├── index.d.ts       # TypeScript declarations
│   ├── unstyled.js      # Unstyled components (CommonJS)
│   ├── unstyled.mjs     # Unstyled components (ESM)
│   ├── unstyled.d.ts    # Unstyled TypeScript declarations
│   └── styles.css       # CSS for animations
├── README.md
├── LICENSE
└── package.json
```

## Post-publish

After publishing:
1. Verify the package on npm: https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit
2. Test installation in a new project
3. Update the GitHub repository with the new tag
4. Create a GitHub release with the changelog

## Version 1.0.7 Highlights

- **Headless Mode**: Complete separation of state from UI
- **Enhanced Hooks**: All requested methods in useConsent
- **Unstyled Components**: For complete design freedom
- **Render Props**: Maximum flexibility
- **Event System**: Subscribe to consent changes
- **TypeScript Generics**: Custom consent categories
- **Better Documentation**: Comprehensive examples