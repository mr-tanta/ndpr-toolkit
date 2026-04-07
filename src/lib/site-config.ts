/**
 * Site-wide configuration values.
 * Update these when cutting a new release.
 *
 * Version is read from package.json automatically.
 * Other stats should be updated manually after each release.
 */
import pkg from '../../package.json';

export const siteConfig = {
  /** Package version — pulled from package.json automatically */
  version: pkg.version,

  /** Number of compliance modules */
  moduleCount: 8,

  /** Number of passing tests */
  testCount: 194,

  /** Number of customizable classNames sections */
  classNameSections: 194,

  /** Number of components with classNames support */
  componentCount: 19,

  /** Number of modular import paths */
  importPaths: 11,

  /** npm package name */
  packageName: '@tantainnovative/ndpr-toolkit',

  /** Site URL */
  siteUrl: 'https://ndprtoolkit.com.ng',

  /** GitHub repo */
  repoUrl: 'https://github.com/mr-tanta/ndpr-toolkit',

  /** npm URL */
  npmUrl: 'https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit',
} as const;
