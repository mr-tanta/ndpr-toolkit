# Twitter/X Thread

> Post as a thread. Include a screenshot or demo GIF with tweet 1.

---

**Tweet 1 (Hook)**

Does your app collect data from Nigerian users?

The NDPA 2023 — now operationalised by the NDPC's GAID 2025 directive — applies to you. It covers 8 areas: consent, DSR, DPIA, breach notification, privacy policy, lawful basis, cross-border transfers, and ROPA.

I built an open-source React + TypeScript toolkit that handles all 8. 🧵

---

**Tweet 2 (Consent)**

1/ Consent banner in one line:

```tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRConsent />
```

Purpose-specific consent, an easy decline, withdrawal mechanism, audit trail. GAID 2025 cookie rules, handled out of the box.

---

**Tweet 3 (Compliance Score)**

2/ Not sure where you stand? Run a compliance score:

The engine evaluates all 8 NDPA modules and tells you exactly what to fix, sorted by enforcement risk.

Consent and breach notification weigh highest — the NDPC enforces them most.

---

**Tweet 4 (GAID 2025 + CLI)**

3/ New: the GAID 2025 layer.

— Classify your DCPMI registration tier + annual fee
— Schedule your Compliance Audit Returns (CAR)
— Check a breach notification against the 72-hour rule

…and gate it all in CI:

```
npx ndpr audit --min-score 80
```

Exits non-zero when you regress.

---

**Tweet 5 (Architecture)**

4/ Architecture built for real projects:

- 22 tree-shakeable subpath exports
- Works with ANY CSS framework
- Pluggable storage (localStorage, cookies, API, compose)
- 1,297 tests, full TypeScript
- React 18 & 19

Import only what you need. Your bundle stays small.

---

**Tweet 6 (Stakes)**

5/ Why this matters:

Multichoice Nigeria: ₦766M fine (cross-border transfers)
NDPC fines: up to 2% of annual gross revenue or ₦10M
GAID 2025: annual audit returns + 72-hour breach notification

This is not theoretical. The NDPC is actively enforcing.

---

**Tweet 7 (CTA)**

6/ Free and open source (MIT):

npm: @tantainnovative/ndpr-toolkit
GitHub: github.com/mr-tanta/ndpr-toolkit
Docs: ndprtoolkit.com.ng

Run a free 5-minute audit:
ndprtoolkit.com.ng/score

Star it if it helps. RT to help other Nigerian devs find it.

---

# LinkedIn Post

> Shorter, more professional tone. Include the npm link.

---

I maintain an open-source compliance toolkit for the Nigeria Data Protection Act (NDPA) 2023 — now updated for the NDPC's GAID 2025 directive.

If your application collects personal data from anyone in Nigeria, the NDPA applies to you. The penalties are significant — Multichoice was fined ₦766 million for cross-border transfer violations, and the NDPC can levy up to 2% of annual gross revenue.

The NDPA Toolkit handles all 8 compliance areas:

- Consent management (Sections 25–26)
- Data subject rights portal (Part VI, Sections 34–38)
- DPIA questionnaire (Section 28)
- Breach notification workflow (Section 40)
- Privacy policy generator (Section 27)
- Lawful basis tracker (Section 25)
- Cross-border transfer manager (Sections 41–43)
- Record of Processing Activities (Section 29)

On top of the modules, it now ships the GAID 2025 layer: a DCPMI registration-tier classifier, a Compliance Audit Returns scheduler, and a breach-notification completeness checker — plus an `ndpr audit` CLI that gates compliance in CI and exits non-zero when you regress.

It's a React component library with 22 tree-shakeable subpath exports, 1,297 tests, full TypeScript support, pluggable storage adapters, and zero-config presets for teams that need to move fast. The compliance score engine evaluates your posture across all 8 modules and tells you exactly what to fix, sorted by NDPC enforcement risk.

Free. MIT licensed. Works with React 18 & 19, Next.js, and any CSS framework.

npm: https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit
GitHub: https://github.com/mr-tanta/ndpr-toolkit
Documentation: https://ndprtoolkit.com.ng

Run a free 5-minute NDPA self-assessment: https://ndprtoolkit.com.ng/score

If you work with Nigerian data or know someone who does, I'd appreciate a share.

#NDPA #GAID2025 #DataProtection #Nigeria #React #NextJS #OpenSource #Compliance
