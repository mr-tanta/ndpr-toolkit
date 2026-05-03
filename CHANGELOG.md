# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [3.4.0](https://github.com/mr-tanta/ndpr-toolkit/compare/v3.3.1...v3.4.0) (2026-05-03)


### Features

* **ndpr-toolkit:** complete BEM migration for all remaining components (3.5.x) ([052827a](https://github.com/mr-tanta/ndpr-toolkit/commit/052827a1c10390998c681d222070e797aa75acde))
* **ndpr-toolkit:** ship /server subpath for RSC-safe pure-logic imports ([5dbb24d](https://github.com/mr-tanta/ndpr-toolkit/commit/5dbb24dcd88235a4e184ef8cca7fdf105c35934d))
* **ndpr-toolkit:** styled-defaults UI strategy (B4 + S1) ([b875d3b](https://github.com/mr-tanta/ndpr-toolkit/commit/b875d3b66ad36a9df8b12431e1d95f9257537db1))


### Bug Fixes

* **ndpr-toolkit:** auto-init useDefaultPrivacyPolicy + isolate PolicyPage CSS ([550e015](https://github.com/mr-tanta/ndpr-toolkit/commit/550e015f1011d975dea90e417cd699ee2fb9187d))
* **ndpr-toolkit:** packaging — style export, CHANGELOG, RSC directives ([d0bf85b](https://github.com/mr-tanta/ndpr-toolkit/commit/d0bf85b6990f02cb4aeb3dbaa448e5d5643cde29))
* **ndpr-toolkit:** policy templates no longer ship literal placeholders to production ([6c373a8](https://github.com/mr-tanta/ndpr-toolkit/commit/6c373a8dadf21a565539888042e2be36a1ba9510))
* **ndpr-toolkit:** unblock pnpm build, document core entry honestly ([ab2f5d7](https://github.com/mr-tanta/ndpr-toolkit/commit/ab2f5d7a031300e11180e093e9b3c14b793f957a))
* **ndpr-toolkit:** use direct localStorage check to detect rehydration race ([df81d9b](https://github.com/mr-tanta/ndpr-toolkit/commit/df81d9b42720b9265964a6f6405f767cf2c152c7))


### Documentation

* **phase1:** add v3.3.1 integration feedback triage ([37b4a92](https://github.com/mr-tanta/ndpr-toolkit/commit/37b4a922f5364da8da595ca971785ddabf1a9074))
* rename external-feedback references for public release ([afb7fa0](https://github.com/mr-tanta/ndpr-toolkit/commit/afb7fa000c2c9d575bf46c26b0271896b49db04e))

## [3.3.1](https://github.com/tantainnovative/ndpr-toolkit/compare/v3.3.0...v3.3.1) (2026-04-23)


### Features

* add Next.js App Router example project ([8772478](https://github.com/tantainnovative/ndpr-toolkit/commit/8772478e6cf642bc5da278ca771824f0a1d44825)), closes [#13](https://github.com/mr-tanta/ndpr-toolkit/issues/13)
* add Nigerian Pidgin (pcm) locale support ([dc31a10](https://github.com/tantainnovative/ndpr-toolkit/commit/dc31a102853c6206f86d990663ea1318e41f0297)), closes [#12](https://github.com/mr-tanta/ndpr-toolkit/issues/12)


### Bug Fixes

* patch 6 Dependabot vulnerabilities via pnpm overrides ([51695a6](https://github.com/tantainnovative/ndpr-toolkit/commit/51695a6dbe257826f5ff6c45a68d76920c9987b2))
* resolve all audit findings — docs, hydration, hooks, DX, and tests ([a0fa3a5](https://github.com/tantainnovative/ndpr-toolkit/commit/a0fa3a50a78b249e64d4e604890b4ca7c0da48e0))
* resolve type errors in DSR test files after any-to-unknown migration ([6412195](https://github.com/tantainnovative/ndpr-toolkit/commit/64121956635c65e588351b8249497a4b8aa2f56e))
* update outdated test counts and stats across docs and marketing ([b8d3845](https://github.com/tantainnovative/ndpr-toolkit/commit/b8d38453a0347d01fa79cbe4a83d87c05a98a4f2))

## [3.3.0](https://github.com/tantainnovative/ndpr-toolkit/compare/v3.2.1...v3.3.0) (2026-04-23)


### Features

* i18n, accessibility, type safety, backend completion, and DX improvements ([8fa6d83](https://github.com/tantainnovative/ndpr-toolkit/commit/8fa6d830eeeec50d53b8e28076a790c31e423852))


### Bug Fixes

* resolve type errors in adapter test files for CI ([7c4b5b9](https://github.com/tantainnovative/ndpr-toolkit/commit/7c4b5b9194776f6d92b347064f447d6f681f6f7d))


### Documentation

* add comprehensive NDPA compliance guide for React/Next.js ([9be4502](https://github.com/tantainnovative/ndpr-toolkit/commit/9be450253fed53efcfe095cabe161b97a8834e05))
* add screenshots and visual badges to README ([4aff0df](https://github.com/tantainnovative/ndpr-toolkit/commit/4aff0dfb5d8d1ffb07a388ccee445aec5bdcaa54)), closes [#11](https://github.com/mr-tanta/ndpr-toolkit/issues/11)
* add v3.2.1 release blog post covering all 42 fixes ([1dd9310](https://github.com/tantainnovative/ndpr-toolkit/commit/1dd93105b6f4444cf9a6287ae6f21845c0d998d9))

## [3.2.1](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.11...v3.2.1) (2026-04-15)


### Features

* add adapter support and compound components to Breach module ([27bc8c4](https://github.com/tantainnovative/ndpr-toolkit/commit/27bc8c4e9aec0f665e8cd2854c4a4febaf411596))
* add adapter support and compound components to CrossBorder module ([810d04f](https://github.com/tantainnovative/ndpr-toolkit/commit/810d04ff17cdf452942ba1ef1b3908efe73f3cfe))
* add adapter support and compound components to DPIA module ([87f15fb](https://github.com/tantainnovative/ndpr-toolkit/commit/87f15fb465af118e15b1ba06a92275283872984a))
* add adapter support and compound components to DSR module ([0099a4f](https://github.com/tantainnovative/ndpr-toolkit/commit/0099a4f61eb7a3a99892e2101eed151bf772829c))
* add adapter support and compound components to LawfulBasis module ([a973de4](https://github.com/tantainnovative/ndpr-toolkit/commit/a973de407b721fc20f37b2f2c1ecbee3e78bb3e8))
* add adapter support and compound components to Policy module ([4b58327](https://github.com/tantainnovative/ndpr-toolkit/commit/4b5832757249824f9b3c20cf8c375a4f80d1ab25))
* add adapter support and compound components to ROPA module ([22ee47c](https://github.com/tantainnovative/ndpr-toolkit/commit/22ee47c284e7523453d2f36719708cabdae38544))
* add adapter support to useConsent hook ([3aee8fe](https://github.com/tantainnovative/ndpr-toolkit/commit/3aee8fede3a29d5b4f94f99b0894abc5177a017e))
* add adapters entry point ([13971d1](https://github.com/tantainnovative/ndpr-toolkit/commit/13971d15abbbe25e6cb8ea677d4a9c60a5b84d2b))
* add adaptive policy section generators ([7bb28a6](https://github.com/tantainnovative/ndpr-toolkit/commit/7bb28a6b1c0d724036fe15b354c635eeece2cbc5))
* add blog system with MDX posts and SEO ([8388e0f](https://github.com/tantainnovative/ndpr-toolkit/commit/8388e0fd3fce4904bcfa98b6325743e84f22250c))
* add classNames + unstyled props to all 19 components ([c1731ff](https://github.com/tantainnovative/ndpr-toolkit/commit/c1731ff8a15fc51c88f33888703fac468be8311b))
* add compliance checker sidebar and draft save indicator ([aaa34df](https://github.com/tantainnovative/ndpr-toolkit/commit/aaa34df035d71bfcf2cabf1ef120ac0a45928c0c))
* add compliance score engine ([fc6d92a](https://github.com/tantainnovative/ndpr-toolkit/commit/fc6d92ab10814571605882cf85ddf045b5bcddd6))
* add composeAdapters for multi-target persistence ([b92f072](https://github.com/tantainnovative/ndpr-toolkit/commit/b92f07251c33b53e05df50d54e2b6daf697272f7))
* add comprehensive design system and site components ([28fc38f](https://github.com/tantainnovative/ndpr-toolkit/commit/28fc38ff2880171774761931192728c8e89425f4))
* add Consent compound sub-components ([598ea5a](https://github.com/tantainnovative/ndpr-toolkit/commit/598ea5a152b6223cb3f68056eb01ece6209285e1))
* add Consent.Provider compound component ([8b1c622](https://github.com/tantainnovative/ndpr-toolkit/commit/8b1c6225e6b5695be1d0e6bcb11009ffedfd592b))
* add create-ndpr CLI scaffolder ([60ae4dd](https://github.com/tantainnovative/ndpr-toolkit/commit/60ae4dd0b9048f9f7163509307b5e7293b8dc1f6))
* add cross-border transfer assessment module (NDPA Part VI) ([36e8160](https://github.com/tantainnovative/ndpr-toolkit/commit/36e8160f31c8103c611cc9249f9862fc9e7183ec))
* add DOCX policy export with optional dependency ([2ead6a3](https://github.com/tantainnovative/ndpr-toolkit/commit/2ead6a3152491928716ef2f2d6928a947f0c60e7))
* add Drizzle ORM schema and adapters ([dab8a2e](https://github.com/tantainnovative/ndpr-toolkit/commit/dab8a2e5680ac6339bc510090aa2864df5e5981c))
* add Drizzle schema, integration example, and documentation ([fe95508](https://github.com/tantainnovative/ndpr-toolkit/commit/fe95508528db5e57cdaba1af94031523b76af5cd))
* add Express routes and middleware ([35fcf69](https://github.com/tantainnovative/ndpr-toolkit/commit/35fcf69bf74176f25226d56ca23f7d9102b04eff))
* add HTML and Markdown policy export ([f30ea3d](https://github.com/tantainnovative/ndpr-toolkit/commit/f30ea3d72b80b2fd90e937d66abb8d820c0d279e))
* add i18n locale support with default English strings ([a0aa702](https://github.com/tantainnovative/ndpr-toolkit/commit/a0aa70221396bef638d7ddbae4f23052d7878074))
* add JSON-LD structured data to key pages for Google rich results ([ebf9298](https://github.com/tantainnovative/ndpr-toolkit/commit/ebf929887da8c0e215d334758101e7b6d23d0842))
* add lawful basis tracker module (NDPA Section 25) ([cdd39e3](https://github.com/tantainnovative/ndpr-toolkit/commit/cdd39e3e997cf81277dd0fbac1dfc571c1bd6729))
* add localStorage adapter ([a49e565](https://github.com/tantainnovative/ndpr-toolkit/commit/a49e565081b5d73f2e9806ad1e326ad689af90f5))
* add NDPA policy compliance checker with 15 requirements ([596fb27](https://github.com/tantainnovative/ndpr-toolkit/commit/596fb27c75c8588cc367f10d344dcaf21cbd67e4))
* add NDPRConsent zero-config preset ([1720afa](https://github.com/tantainnovative/ndpr-toolkit/commit/1720afad2d734ec210f6dafe5249689ac2d77100))
* add NDPRDashboard compliance dashboard component ([8579c5d](https://github.com/tantainnovative/ndpr-toolkit/commit/8579c5d41c36f74d21626406eea3013a1c4fb34b))
* add Next.js App Router API routes ([0053bdc](https://github.com/tantainnovative/ndpr-toolkit/commit/0053bdc3b7e598535fd8ae757fde432ac1b3c46e))
* add PDF policy export with cover page and TOC ([6aa2515](https://github.com/tantainnovative/ndpr-toolkit/commit/6aa251575a440936b0b120db161baf6dc75adfec))
* add policy engine types and template context ([b5fea8c](https://github.com/tantainnovative/ndpr-toolkit/commit/b5fea8c29b8ffe2edf77e785b9c9da9f276e0999))
* add policy review step with section cards and export panel ([c00e697](https://github.com/tantainnovative/ndpr-toolkit/commit/c00e697ef22b02e7afc4c472139ae408b7fe1ca1))
* add policy wizard step components (about, data, processing) ([3be7142](https://github.com/tantainnovative/ndpr-toolkit/commit/3be7142869ac3a94298425b630538bc500a4559b))
* add PolicyPage, update preset and entry points for adaptive wizard ([b2da198](https://github.com/tantainnovative/ndpr-toolkit/commit/b2da1988c19f872b658431e9ed8a5b4549705abf))
* add PostHog analytics integration ([f154d41](https://github.com/tantainnovative/ndpr-toolkit/commit/f154d41e10379fde1fd52a7dd3dda92d04c8b5ef))
* add Prisma ORM adapters for all modules ([8200979](https://github.com/tantainnovative/ndpr-toolkit/commit/820097903e3ab5eb43bf980dee7eb93d7499769d))
* add record of processing activities (ROPA) module ([54ab04e](https://github.com/tantainnovative/ndpr-toolkit/commit/54ab04ec27b1c35f80d4276f6be8313486ad5ebb))
* add REST API adapter ([42207bc](https://github.com/tantainnovative/ndpr-toolkit/commit/42207bcbe09ebccd9c924ce44790b652c44d0221))
* add sessionStorage, cookie, and memory adapters ([cc419e5](https://github.com/tantainnovative/ndpr-toolkit/commit/cc419e5ef7ad35dd3613de0b931e384337fa141d))
* add site header/footer, 5 SEO blog posts, updated sitemap ([5278c18](https://github.com/tantainnovative/ndpr-toolkit/commit/5278c1878052f32aa93f51d5d98b09d470c670ca))
* add StorageAdapter interface ([98eec0a](https://github.com/tantainnovative/ndpr-toolkit/commit/98eec0a454fd96406fc1057c8d548bde51b0bfe1))
* add useAdaptivePolicyWizard hook ([f6abf13](https://github.com/tantainnovative/ndpr-toolkit/commit/f6abf13f5bb907d435734545533478b80e01ba62))
* add zero-config presets for all remaining modules ([9ecc714](https://github.com/tantainnovative/ndpr-toolkit/commit/9ecc714d631554e384a1b64dc5a8700cde898a17))
* auto-update version and stats across the site ([cfe468f](https://github.com/tantainnovative/ndpr-toolkit/commit/cfe468f299f28b7840603ab579fc23db9be83f93))
* complete site redesign with blue primary palette ([410fac6](https://github.com/tantainnovative/ndpr-toolkit/commit/410fac688cd6ae9e860e8e36dfb3074af5f52201)), closes [#2563](https://github.com/mr-tanta/ndpr-toolkit/issues/2563)
* comprehensive SEO overhaul for organic discovery ([97d3b79](https://github.com/tantainnovative/ndpr-toolkit/commit/97d3b799b106a31b06b753fce131f79689f5ba28))
* export compliance score from core and hooks entry points ([3310797](https://github.com/tantainnovative/ndpr-toolkit/commit/3310797f2d9cadbb1a66b6234a28a4f1bce03ee7))
* export Consent compound components from consent entry point ([be2ea70](https://github.com/tantainnovative/ndpr-toolkit/commit/be2ea70dba820502732f94fbad81ae69afc261f3))
* improve internal linking and update sitemap ([2b50f33](https://github.com/tantainnovative/ndpr-toolkit/commit/2b50f33defa03cde2eef3c6ac963930ea5ed16c2))
* modular imports and lightweight core — v2.1.0 ([3cbb5a6](https://github.com/tantainnovative/ndpr-toolkit/commit/3cbb5a6ad1f4d5417d400ed43d8331b3c84739cd))
* privacy policy upgrade — adaptive wizard, compliance checker, professional exports ([a84e4f9](https://github.com/tantainnovative/ndpr-toolkit/commit/a84e4f9ca061a911a562b04022b3459e0b1a61bb))
* redesign 7 implementation guide pages ([19711fa](https://github.com/tantainnovative/ndpr-toolkit/commit/19711fad8d0e7aed22b9c1444511f3c2969a8e0f))
* redesign consent, dsr, dpia, breach demo pages ([5373a2f](https://github.com/tantainnovative/ndpr-toolkit/commit/5373a2ffffb2f100c498239d3da183e6dc803933))
* redesign consent, dsr, dpia, breach, policy component doc pages ([248ee0f](https://github.com/tantainnovative/ndpr-toolkit/commit/248ee0fb71b6c2cce36bc4f31e7116ac13c4e93c))
* redesign demo site with interactive playgrounds ([1cedd1b](https://github.com/tantainnovative/ndpr-toolkit/commit/1cedd1ba4e6b9b3a0fedd5cd9b2bfc80396945c6))
* redesign docs landing and demos landing pages ([27de488](https://github.com/tantainnovative/ndpr-toolkit/commit/27de488cbf71b7218293920b28f3bfcf3f11ac84))
* redesign homepage with new design system ([31a74ee](https://github.com/tantainnovative/ndpr-toolkit/commit/31a74ee185e7ccf681999fe970a0de16fc437e3a))
* redesign lawful-basis, cross-border, ropa, hooks doc pages ([c2455cb](https://github.com/tantainnovative/ndpr-toolkit/commit/c2455cb5c2e7821264a40453efc07a7d94c9283c))
* redesign policy, lawful-basis, cross-border, ropa demo pages ([9e00802](https://github.com/tantainnovative/ndpr-toolkit/commit/9e008025e35c51747eff2c5fb09876972e6f45ab))
* redesign v3 guide pages (adapters, compounds, presets, score, backend, styling) ([5bbc7e3](https://github.com/tantainnovative/ndpr-toolkit/commit/5bbc7e3366c98ffebb759333c772496c5dea842c))
* scaffold ndpr-recipes package with Prisma schema ([20b6943](https://github.com/tantainnovative/ndpr-toolkit/commit/20b69435f6b0f56bc057b42bd2c0577b744e50e2))
* update policy demo page with AdaptivePolicyWizard ([428176b](https://github.com/tantainnovative/ndpr-toolkit/commit/428176bb763a5a6baa0ab60de373f900d381c6d3))
* update SEO metadata, sitemap, and structured data for v3 ([aea1a06](https://github.com/tantainnovative/ndpr-toolkit/commit/aea1a060e1ec7dd8e104e3fa5ad9e4fec6cc0a32))
* use published AdaptivePolicyWizard in policy demo ([0b2d7fc](https://github.com/tantainnovative/ndpr-toolkit/commit/0b2d7fc6d4afe3fe25a7a2400cdce22b12b41990))
* use published toolkit imports in consent and DSR demos ([8d86102](https://github.com/tantainnovative/ndpr-toolkit/commit/8d86102a41b02ee7d775eaf6d1e2501cd647b562))
* use published toolkit imports in lawful-basis, cross-border, ropa demos ([bac2b3a](https://github.com/tantainnovative/ndpr-toolkit/commit/bac2b3a894009a2bd1df37b966202f152741fb0f))
* v2.2.0 — fully customizable styling with classNames + unstyled ([3558c27](https://github.com/tantainnovative/ndpr-toolkit/commit/3558c275a0d9d3dd286f8f8e242ab35f7e7bc4ae))
* v2.3.0 — theming, portal, typed callbacks, templates, provider ([9743c44](https://github.com/tantainnovative/ndpr-toolkit/commit/9743c4445d7882659bb5c45afcbea22bf580639f))
* v2.4.0 — resolve 30 developer feedback items ([01a9930](https://github.com/tantainnovative/ndpr-toolkit/commit/01a99301d4c655b8f34536284adbe8557866d022))
* v3.0.0 — layered architecture, adapters, compound components, presets, compliance score, backend recipes, CLI scaffolder, dashboard ([d46b641](https://github.com/tantainnovative/ndpr-toolkit/commit/d46b641086d10ea061191289bcaf96fe5674e0e3))


### Bug Fixes

* add @testing-library/dom peer dependency for CI compatibility ([626b517](https://github.com/tantainnovative/ndpr-toolkit/commit/626b5172e0a6c8960bcdba50b5bb298a504f8075))
* add adapters and presets to root package.json exports, exclude template packages from tsc ([178bf7f](https://github.com/tantainnovative/ndpr-toolkit/commit/178bf7fc612dd4824f9ee3a57afd15b6007a6f5b))
* add dark-mode overrides for Related Guides links and Tailwind theme classes in docs ([e26aef6](https://github.com/tantainnovative/ndpr-toolkit/commit/e26aef6d939b21650b5b1b3c480822f4cc5c3c07))
* add force-static export to robots and sitemap for static build ([b1a5791](https://github.com/tantainnovative/ndpr-toolkit/commit/b1a5791d3ccaba85a847796664a3f848d4039bdd))
* add PostHog env variables to build:lib step ([5401268](https://github.com/tantainnovative/ndpr-toolkit/commit/54012681b0fb103293675e3ee865443cadc74c26))
* add presets entry to tsup config and fix types paths ([d3805da](https://github.com/tantainnovative/ndpr-toolkit/commit/d3805da3555055bd3ddbc903f2966972be1574b6))
* consent demo toggles now update state correctly ([fc710d2](https://github.com/tantainnovative/ndpr-toolkit/commit/fc710d2841088ef936f0aeccb932748dd367807f))
* correct all ComplianceInput and ComplianceReport field names in docs ([2e64943](https://github.com/tantainnovative/ndpr-toolkit/commit/2e64943cc7ffe8b5d899e7deda4067b102db336f))
* correct code snippets in consent demo ([b6c3edf](https://github.com/tantainnovative/ndpr-toolkit/commit/b6c3edfab78df5ac1eadc4fc9aa396e06541c307))
* correct consent component and hook API references in docs ([c5b6b84](https://github.com/tantainnovative/ndpr-toolkit/commit/c5b6b8473cc0099ec8ae2980fa884fbcd86836da))
* correct consent demo code examples to match actual API ([5040aad](https://github.com/tantainnovative/ndpr-toolkit/commit/5040aadb3cd32b6b8e16bdc0159dd70d760064d0))
* correct documentation URLs to ndprtoolkit.com.ng ([7be38fe](https://github.com/tantainnovative/ndpr-toolkit/commit/7be38fecaa5b67b680ddd5a6cb52ab0018e7850c))
* correct StorageAdapter interface in docs, expand compound components guide ([92fd16e](https://github.com/tantainnovative/ndpr-toolkit/commit/92fd16e72d1aa9247811fffc9ba483f5202be080))
* deep QA audit — 50+ fixes across entire project ([adbd94c](https://github.com/tantainnovative/ndpr-toolkit/commit/adbd94cdfc74636ab02fe4910bbc68837c81c0fb))
* eliminate all 404s, broken links, and misinformation ([8d1bdb7](https://github.com/tantainnovative/ndpr-toolkit/commit/8d1bdb7725e1255025b4b2063b6e764a07d46621))
* eliminate all vulnerabilities (52 → 0) ([e6dc1b7](https://github.com/tantainnovative/ndpr-toolkit/commit/e6dc1b7455471fef453082a56ef659f16bab82cc))
* explicitly add PostHog env variables to Next.js config ([5ba341d](https://github.com/tantainnovative/ndpr-toolkit/commit/5ba341dcc20fd8968dedf842b39468b191fc86e0))
* export DSRFormSubmission and BreachFormSubmission from per-module entry points ([ae5cf79](https://github.com/tantainnovative/ndpr-toolkit/commit/ae5cf79c8301d83b910dcca2e4d8479f384ed69c)), closes [#14](https://github.com/mr-tanta/ndpr-toolkit/issues/14)
* handle missing PostHog env variables gracefully ([6851e24](https://github.com/tantainnovative/ndpr-toolkit/commit/6851e2445fb43bcc14faa424c28c8e38e26a0b8f))
* improve mobile responsiveness across all demo pages and homepage ([1027de7](https://github.com/tantainnovative/ndpr-toolkit/commit/1027de731b0b1bd8c34c5497c9439f7cec6a2f46))
* improve privacy policy demo UI with comprehensive dark-mode overrides ([ce7f3ea](https://github.com/tantainnovative/ndpr-toolkit/commit/ce7f3ea08fcdaef625d3c1a604e8726fb7dbff2a)), closes [#2563](https://github.com/mr-tanta/ndpr-toolkit/issues/2563)
* move force-static export before function declaration in sitemap ([36ee87a](https://github.com/tantainnovative/ndpr-toolkit/commit/36ee87a95594a6accecd131e010bf0c5130ab941))
* pass onGenerate prop to PolicyGenerator in demo ([dff0c05](https://github.com/tantainnovative/ndpr-toolkit/commit/dff0c059a1f55fdb2843331c56ab2b915dcc3c3c))
* preserve code block indentation and add language labels ([4cb8fca](https://github.com/tantainnovative/ndpr-toolkit/commit/4cb8fca1fca96241b4959b3ceaa6c62835f673de))
* QA audit — resolve bugs, type conflicts, and stale references ([4884735](https://github.com/tantainnovative/ndpr-toolkit/commit/48847354b7e6a187544e783a49b6f2f92942c2a2))
* redesign footer with proper attribution ([d8c9bac](https://github.com/tantainnovative/ndpr-toolkit/commit/d8c9bac0fa69f28fc5612fb8a22584df3be7a688))
* redesign navbar with better contrast and SVG logo ([4946b10](https://github.com/tantainnovative/ndpr-toolkit/commit/4946b105785882439d72a6222030fd1590ef8d33))
* reduce vulnerabilities from 60 to 14 ([9dd5614](https://github.com/tantainnovative/ndpr-toolkit/commit/9dd5614d3fade0768c1fd99d8093920931a52816))
* remove blue left border from demo cards ([a112678](https://github.com/tantainnovative/ndpr-toolkit/commit/a11267886ba00e83f37bd6f72c6a686b74f13d3c))
* reorganize static HTML for proper GitHub Pages routing ([256b31f](https://github.com/tantainnovative/ndpr-toolkit/commit/256b31f5e4efcc99c7b0cb9c7794b3a9ae303436))
* replace rainbow color palette with unified blue brand identity ([c140ff0](https://github.com/tantainnovative/ndpr-toolkit/commit/c140ff078165263a19cc36bcbe25a50ea02a992b))
* resolve 42 bugs across security, hooks, adapters, components, and utils ([d5f160f](https://github.com/tantainnovative/ndpr-toolkit/commit/d5f160f4bdbae6601b5c683c2a3c6245e2fd2727))
* resolve picomatch and flatted security vulnerabilities ([82cb446](https://github.com/tantainnovative/ndpr-toolkit/commit/82cb4463fc6a3bd8699c9a3d51e426ae3c701437))
* resolve strict TypeScript errors in test files ([085ca52](https://github.com/tantainnovative/ndpr-toolkit/commit/085ca52db4c9732c9436bf53ca2a8d3c904c411b))
* resolve type mismatches in cross-border, ropa, lawful-basis demos ([1269e6e](https://github.com/tantainnovative/ndpr-toolkit/commit/1269e6e9931eceb3c01ea0d1efa9806b3e2285fa))
* standardize docs to use pnpm and per-module imports ([fbdbf16](https://github.com/tantainnovative/ndpr-toolkit/commit/fbdbf16647d31afc28caf3347818ece2018a8b6d))
* transparent nav background, explicit gradient on CTA button ([45bd144](https://github.com/tantainnovative/ndpr-toolkit/commit/45bd144393640c1e7e8634505c8037b50bc74c94))
* unify color scheme, fix links, remove legacy-peer-deps ([e35d4c1](https://github.com/tantainnovative/ndpr-toolkit/commit/e35d4c1737f76206bc75c1a824033f8d1f570c7e))
* update demo imports to use local source and fix React bundling ([831a501](https://github.com/tantainnovative/ndpr-toolkit/commit/831a501b5b9c909e535e2f020484cab22970fedd))
* update homepage hero with accurate data ([b931230](https://github.com/tantainnovative/ndpr-toolkit/commit/b931230d8dcc1c772cee019c33870ad9d6a6c924))
* update nav colors and design tokens ([b9fb7c2](https://github.com/tantainnovative/ndpr-toolkit/commit/b9fb7c2ad45742cfcf0afc09153eee79e3de4173))
* use async useEffect for adapter load in NDPRROPA preset ([a1b3820](https://github.com/tantainnovative/ndpr-toolkit/commit/a1b38207ac488c7a400e272157894ec62afb26a1))
* use constants for PostHog env variables to ensure build-time inlining ([4ed9c1c](https://github.com/tantainnovative/ndpr-toolkit/commit/4ed9c1ca65eba51cc51c638f7c16eaed7ea93f5e))
* use existing PolicyGenerator in demo until adaptive wizard is published ([d5f195f](https://github.com/tantainnovative/ndpr-toolkit/commit/d5f195f55fa1977e3a910a6824a38f327ec45176))
* useDPIA isComplete() no longer mutates state during render ([fd7ea9d](https://github.com/tantainnovative/ndpr-toolkit/commit/fd7ea9d5f22a9987fa7e62f54704b3ed28a5fd9f))
* wrap consent demo page in ConsentProvider to fix loading issue ([8ba7cf0](https://github.com/tantainnovative/ndpr-toolkit/commit/8ba7cf09112f3a74a0187100c2291b8bd7b0fd7c))


### Documentation

* add import paths guide to docs site ([6d7e19a](https://github.com/tantainnovative/ndpr-toolkit/commit/6d7e19a6584bdc0f22e8947b1fa51375ee2f51e8))
* add internationalization and CLI scaffolder guide pages ([2dab79a](https://github.com/tantainnovative/ndpr-toolkit/commit/2dab79a46728c88a218cec32a0c9af7584d1b6f9))
* add privacy and analytics disclosure to README ([aac2c69](https://github.com/tantainnovative/ndpr-toolkit/commit/aac2c69593265d59e6cd5552a9f5b1802cdb384a))
* add v3 guides for adapters, compounds, presets, compliance score, and backend integration ([47503e2](https://github.com/tantainnovative/ndpr-toolkit/commit/47503e2a3738e951d6103205ecbc31579cd9ab9a))
* add v3 quick start sections to consent, dsr, breach component docs ([1519501](https://github.com/tantainnovative/ndpr-toolkit/commit/1519501041885c2608b3044f06f9da4aa3f2d4a6))
* expand backend integration guide and add NDPRDashboard docs ([592d63d](https://github.com/tantainnovative/ndpr-toolkit/commit/592d63d5b85f8a07d50562fef73b17403cd33141))
* overhaul documentation and demo site for NDPA 2023 ([cde6517](https://github.com/tantainnovative/ndpr-toolkit/commit/cde651729bc40436ec2b5bf062151fa1bb8eb5c6))
* rewrite README for v3.0.0 ([97fca14](https://github.com/tantainnovative/ndpr-toolkit/commit/97fca1462f813ecfbfdda9cfbc94a0d7eec493c9))
* update site homepage and docs landing for v3.0.0 ([9f6c37c](https://github.com/tantainnovative/ndpr-toolkit/commit/9f6c37c3e74c30b142de6c89bd8fd04067b02b77))


### Code Refactoring

* migrate existing modules from NDPR to NDPA 2023 ([abbec76](https://github.com/tantainnovative/ndpr-toolkit/commit/abbec7640a816c7c64a1b249581aa57e162cfe56))
* update type definitions for NDPA 2023 ([db6e5e3](https://github.com/tantainnovative/ndpr-toolkit/commit/db6e5e305f47bb729587a2cf49ef5f992d81d761))

## [3.2.0] — 2026-04-14

### Added
- **Adaptive Policy Wizard** (`AdaptivePolicyWizard`) — 4-step question-driven privacy policy generator
  - Step 1: Organization details + industry + size
  - Step 2: Data category selection (16 categories across 5 groups)
  - Step 3: Processing purposes, third-party processors, cross-border/automated toggles
  - Step 4: Review, edit, reorder sections, add custom sections, export
- **Policy section engine** (`assemblePolicy()`) — context-aware section generator producing 13 possible sections based on user answers, with industry-adapted language
- **NDPA compliance checker** (`evaluatePolicyCompliance()`) — real-time 15-requirement checklist (115 points max) with auto-fix suggestions
- **Professional PDF export** (`exportPDF()`) — cover page, table of contents, page numbers, headers/footers, NDPA compliance badge
- **DOCX export** (`exportDOCX()`) — Word document with heading styles, headers, footers (optional `docx` peer dependency)
- **HTML export** (`exportHTML()`) — self-contained responsive HTML with embedded styles, print CSS, semantic markup
- **Markdown export** (`exportMarkdown()`) — clean markdown with TOC and metadata
- **PolicyPage component** — embeddable React component for rendering policies at `/privacy-policy`
- **Draft auto-save** — adapter-backed persistence with debounced save and restore-on-reload
- **Custom sections** — UI to add, edit, reorder, and delete custom policy sections (max 10)
- **Compliance checker sidebar** — collapsible panel with score ring, requirement checklist, and "Fix it" buttons
- `useAdaptivePolicyWizard` hook with full state management, compliance tracking, and export functions
- `docx` added as optional peer dependency for Word export

### Changed
- `NDPRPrivacyPolicy` preset now renders the AdaptivePolicyWizard instead of the basic PolicyGenerator

## [3.1.0] — 2026-04-14

### Added
- Complete site redesign with new design system (dark theme, blue primary palette)
- Shared UI component library (Button, Card, Badge, Section, CodeBlock, FeatureCard, Grid, Tabs, CTASection)
- DemoLayout component for consistent demo page presentation
- Redesigned SiteHeader with sticky blur, gradient logo, and responsive mobile menu
- Redesigned SiteFooter with multi-column layout
- Redesigned DocLayout with collapsible sidebar navigation
- i18n locale support — `NDPRLocale` type, `defaultLocale` (English), `mergeLocale()` utility
- `locale` prop on NDPRProvider for global text customization
- Comprehensive SEO updates (sitemap, robots.txt, structured data)
- Prepared `@tantainnovative/create-ndpr` and `@tantainnovative/ndpr-recipes` for npm publishing

### Changed
- All documentation pages restyled with dark theme and consistent design system
- All 8 demo pages wrapped in shared DemoLayout
- Homepage hero with animated code example and 3-file quickstart tabs
- Blog listing and post pages redesigned

## [3.0.0] — 2026-04-14

### Architecture

v3 introduces a layered architecture that separates UI, state, and storage concerns. Every module now supports pluggable persistence, composable sub-components, and zero-config presets.

### Added

- **StorageAdapter pattern** — all 8 hooks accept an optional `adapter` prop for pluggable persistence
  - Built-in adapters: `localStorageAdapter`, `sessionStorageAdapter`, `cookieAdapter`, `apiAdapter`, `memoryAdapter`, `composeAdapters`
  - New `./adapters` entry point: `import { apiAdapter } from '@tantainnovative/ndpr-toolkit/adapters'`
  - `composeAdapters()` writes to multiple targets simultaneously (e.g. localStorage + API)
  - `isLoading` state on all hooks for async adapter support

- **Compound components** — all 8 modules decomposed into composable sub-components
  - `Consent.Provider`, `Consent.Banner`, `Consent.AcceptButton`, `Consent.RejectButton`, `Consent.OptionList`, `Consent.SaveButton`, `Consent.Settings`, `Consent.Storage`
  - `DSR.Provider`, `DSR.Form`, `DSR.Dashboard`, `DSR.Tracker`
  - `DPIA.Provider`, `DPIA.Questionnaire`, `DPIA.Report`, `DPIA.StepIndicator`
  - `Breach.Provider`, `Breach.ReportForm`, `Breach.RiskAssessment`, `Breach.NotificationManager`, `Breach.ReportGenerator`
  - `Policy.Provider`, `Policy.Generator`, `Policy.Preview`, `Policy.Exporter`
  - `LawfulBasis.Provider`, `LawfulBasis.Tracker`
  - `CrossBorder.Provider`, `CrossBorder.Manager`
  - `ROPA.Provider`, `ROPA.Manager`

- **Zero-config presets** — 8 components that work with zero required props
  - `NDPRConsent`, `NDPRSubjectRights`, `NDPRBreachReport`, `NDPRPrivacyPolicy`, `NDPRDPIA`, `NDPRLawfulBasis`, `NDPRCrossBorder`, `NDPRROPA`
  - New `./presets` entry point: `import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets'`
  - Each preset includes NDPA-compliant defaults and accepts optional overrides

- **Compliance score engine** — `getComplianceScore()` and `useComplianceScore()`
  - Scores 0–100 across all 8 modules with NDPA section references
  - Weighted scoring (consent 20%, DSR 15%, breach 15%, policy 12%, DPIA 12%, lawful basis 10%, ROPA 8%, cross-border 8%)
  - Prioritised recommendations with effort estimates
  - Available from `/core` (no React) and `/hooks`

- **@tantainnovative/ndpr-recipes** — backend integration package (separate)
  - Prisma schema (5 NDPA compliance tables)
  - Drizzle ORM schema
  - Next.js App Router API routes (consent, DSR, breach, ROPA, compliance)
  - Express routes and middleware
  - Prisma and Drizzle ORM adapters implementing `StorageAdapter`
  - Consent verification middleware
  - Integration examples

### Changed

- All hooks now use `useCallback` and `useRef` for stable references
- `storageOptions` prop on `useConsent` deprecated in favor of `adapter` prop
- `storageKey`/`useLocalStorage` props on other hooks deprecated in favor of `adapter`

### Migration from v2

All v2 APIs continue to work unchanged. The deprecated `storageOptions`/`storageKey`/`useLocalStorage` props are mapped to built-in adapters internally. To adopt v3 features:

1. **Adapters**: Replace `storageOptions` with `adapter` prop on any hook
2. **Compound components**: Use `<Consent.Provider>` + sub-components for custom layouts
3. **Presets**: Replace boilerplate with zero-config components like `<NDPRConsent />`
4. **Compliance score**: Add `getComplianceScore()` calls to assess compliance posture

## [2.4.0] — 2026-04-07

### Added
- CSS custom properties applied to ALL 19 components (was only consent)
- Consent analytics callback (`onAnalytics` prop with ConsentAnalyticsEvent)
- Consent version enforcement — auto-shows banner when policy version changes
- Consent audit trail utility (createAuditEntry, getAuditLog, appendAuditEntry)
- `manageStorage` prop on ConsentBanner to prevent storage race conditions
- `isSubmitting` prop on DSRRequestForm and BreachReportForm with loading state
- `defaultValues` and `onReset` props on DSRRequestForm and BreachReportForm
- `useDefaultPrivacyPolicy` convenience hook (zero-config privacy policy)
- `primaryButton`/`secondaryButton` classNames aliases across 13 components
- Select All / Deselect All toggle on ConsentBanner customize panel
- Smooth transition animation on ConsentBanner customize panel
- `sanitizeInput` utility for XSS prevention on form submissions
- `data-ndpr-component` attribute with baseline focus-visible styles
- Migration guide blog post (v1.x → v2.x)
- Full classNames reference table in styling documentation (169 keys)

### Fixed
- `show` prop changes after mount now properly sync ConsentBanner visibility
- Email validation regex strengthened (was accepting "a@b.c")
- Color contrast: text-gray-500 → text-gray-600 across 14 components (WCAG AA)
- ARIA: aria-invalid, aria-describedby, role="alert" on form validation errors
- ARIA: focus management on ConsentBanner open
- Responsive: buttons stack vertically on mobile
- Input sanitization prevents XSS in form submissions

### Changed
- Zero runtime dependencies (uuid replaced with crypto.randomUUID)
- lucide-react peer dep widened from ^0.507.0 to >=0.400.0
- TypeScript module declaration added for ./styles import
- All 15 components have NDPA section reference JSDoc comments
- NDPA section references added to default component descriptions

## [2.3.0] — 2026-04-07

### Added
- CSS custom properties (design tokens) for framework-agnostic theming
  - `--ndpr-primary`, `--ndpr-primary-hover`, `--ndpr-background`, etc.
  - Dark mode tokens via `.dark` and `[data-theme="dark"]` selectors
  - Consumers can theme all components by overriding CSS variables once
- `NDPRProvider` context for shared configuration across components
  - Provides organizationName, dpoEmail, theme, unstyled globally
  - `useNDPRConfig()` hook to access config from any component
- Default policy templates — `PolicyGenerator` now works without props
  - `DEFAULT_POLICY_SECTIONS` (8 NDPA-compliant sections)
  - `DEFAULT_POLICY_VARIABLES` (8 common variables)
  - `createBusinessPolicyTemplate()` factory function
- `onValidationError` callback on DSRRequestForm and BreachReportForm
- ConsentBanner `inline` position option for embedding without portal
- ConsentBanner `zIndex` prop (default: 9999)
- Escape key dismisses ConsentBanner

### Fixed
- ConsentBanner now renders via `createPortal` to `document.body` — properly overlays page content instead of rendering inline
- ConsentBanner center position now shows with backdrop overlay
- `onSubmit` callbacks typed — `DSRFormSubmission` and `BreachFormSubmission` replace `any`
- Consent components use CSS variables instead of hardcoded `blue-600`

### Changed
- `PolicyGenerator` sections and variables props are now optional
- `./styles` CSS export now includes design tokens (was animation-only)

## [2.2.0] — 2026-04-07

### Added
- `classNames` prop on all 19 components for granular CSS class overrides
- `unstyled` prop to strip all default Tailwind classes (BYO CSS)
- `resolveClass` utility exported from `/core` and all module paths
- 194 customizable class sections across all components
- Styling & Customization guide in documentation
- Blog post: "Fully Customizable Styling"

### Changed
- Components now work with any CSS framework (Bootstrap, CSS Modules, vanilla CSS)
- Default Tailwind styling preserved — zero breaking changes
- All ClassNames type interfaces exported from barrel files

### Fixed
- Eliminated all npm audit vulnerabilities (52 → 0)
- Reduced package size 67% (512 KB → 170 KB) by excluding source maps
- Upgraded jspdf 3.x → 4.x, replaced abandoned standard-version

## [2.1.2] — 2026-04-06

### Changed
- Exclude source maps from published package (512 KB → 168 KB, 67% reduction)
- Use granular `files` globs instead of blanket `dist/` include

## [2.1.1] — 2026-04-04

### Fixed
- `useDPIA` hook: `isComplete()` no longer mutates state during render (caused infinite re-renders)
- 15 incorrect NDPA section references in PolicyGenerator and ComplianceChecklist
- NDPC naming consistency ("Nigerian" → "Nigeria" Data Protection Commission)
- Breach demo reference number flickering
- DSR demo rejected request timeline, sample due date, and scroll behavior
- DPIA demo step indicator now clickable, critical risk level reachable
- CSV export double-quote escaping per RFC 4180
- 32 form label associations for accessibility
- ARIA attributes on risk sliders and file inputs
- 22 GitHub links corrected to mr-tanta/ndpr-toolkit
- 11 incorrect API examples in READMEs
- 12 fabricated component names removed from docs
- Added MIT LICENSE file
- Removed dead tslib dependency
- Added sideEffects field for tree-shaking
- Added metadataBase for social sharing

## [2.1.0] — 2026-04-04

### Added
- Modular import paths: `/core`, `/hooks`, `/consent`, `/dsr`, `/dpia`, `/breach`, `/policy`, `/lawful-basis`, `/cross-border`, `/ropa`
- Zero-dependency `/core` entry point with all types and utility functions
- React-only `/hooks` entry point for hook consumers
- Per-module entry points for granular tree-shaking
- TypeScript `typesVersions` for IDE auto-completion on all subpaths
- Code splitting via tsup for optimal bundle size

### Changed
- UI dependencies (Radix UI, lucide-react, jspdf, class-variance-authority, clsx, tailwind-merge) moved from `dependencies` to optional `peerDependencies`
- Consumers using only `/core` or `/hooks` no longer install any UI dependencies
- Bundle is now split into shared chunks for better tree-shaking

## [2.0.0] — 2026-04-04

### Breaking Changes
- Rebranded from NDPR focus to NDPA 2023 (Nigeria Data Protection Act)
- `NotificationRequirement.nitdaNotificationRequired` → `ndpcNotificationRequired` (old field deprecated)
- `NotificationRequirement.nitdaNotificationDeadline` → `ndpcNotificationDeadline` (old field deprecated)
- `RegulatoryNotification.nitdaContact` → `ndpcContact` (old field deprecated)

### Added
- Lawful Basis Tracker module (NDPA Section 25)
- Cross-Border Transfer Assessment module (NDPA Part VI)
- Record of Processing Activities (ROPA) module
- New DSR types: 'information' (Section 29) and 'automated_decision_making' (Section 36)
- NDPC consultation fields in DPIA results
- Lawful basis field in consent settings
- NDPC registration number in organization info
- Transfer Impact Assessment types

### Changed
- All legal references updated from NDPR to NDPA 2023
- Regulatory body references updated from NITDA to NDPC
- Section references updated to NDPA sections
- Privacy policy templates updated for NDPA compliance
- Breach notification workflow targets NDPC instead of NITDA
- PostHog moved from dependencies to devDependencies

### [1.0.12](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.11...v1.0.12) (2025-09-30)


### Bug Fixes

* reorganize static HTML for proper GitHub Pages routing ([256b31f](https://github.com/tantainnovative/ndpr-toolkit/commit/256b31f5e4efcc99c7b0cb9c7794b3a9ae303436))

### [1.0.11](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.10...v1.0.11) (2025-09-29)


### Bug Fixes

* support custom domain and update author contact info ([cc30680](https://github.com/tantainnovative/ndpr-toolkit/commit/cc306808b63a672ae4867cfbe8ced51da11a87ec))

### [1.0.10](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.9...v1.0.10) (2025-09-29)


### Documentation

* update author information ([8f866ef](https://github.com/tantainnovative/ndpr-toolkit/commit/8f866ef59246676a0936c43777cc9ec951d19810))

### [1.0.9](https://github.com/tantainnovative/ndpr-toolkit/compare/v1.0.8...v1.0.9) (2025-09-29)


### Bug Fixes

* correct ConsentManager usage in demo page and add gh-pages ([c742a9d](https://github.com/tantainnovative/ndpr-toolkit/commit/c742a9dca89ef3de6b82ea74ea6c1f694a50c503))
* migrate ESLint to v9 flat config and configure lint-staged ([dd6d5ad](https://github.com/tantainnovative/ndpr-toolkit/commit/dd6d5ad91245ce97bf610a3168bc7ddaf32963c7))
* resolve GitHub Actions failures - remove husky prepare script and fix pnpm lockfile compatibility ([c787ba8](https://github.com/tantainnovative/ndpr-toolkit/commit/c787ba81260a20fed999b2dc795fd21cc91f514e))

## [1.0.7] - 2025-01-10

### Added
- **Headless Mode**: Complete separation of state management from UI components
- **Enhanced useConsent Hook**: Added all requested methods (hasUserConsented, showBanner, showSettings, etc.)
- **Unstyled Components**: New unstyled component variants for complete design freedom
- **Render Props Pattern**: Support for maximum flexibility in custom implementations
- **Component Composition**: Mix and match components as needed
- **Event System**: Comprehensive event-driven consent management with `useConsentManager`
- **Position & Animation Controls**: Full control over banner positioning and animations
- **TypeScript Generics**: Support for custom consent categories with full type safety
- **Exported Utilities**: All core utilities and contexts are now accessible
- **Cookie Utils**: Helper functions for cookie management
- **Consent Storage**: Utilities for persisting consent data

### Changed
- Moved React and React DOM to peerDependencies for better compatibility
- Improved package structure with proper exports for different module systems
- Enhanced documentation with comprehensive examples

### Fixed
- Removed circular dependency (package depending on itself)
- Fixed TypeScript declarations generation
- Improved build configuration for library mode

## [1.0.6] - Previous Releases

- Initial public release with core NDPR compliance features
- Consent management system
- Data subject rights portal
- Privacy policy generator
- DPIA assessment tool
- Breach notification module