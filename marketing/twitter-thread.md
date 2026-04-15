# Twitter/X Thread

> Post as a thread. Include a screenshot or demo GIF with tweet 1.

---

**Tweet 1 (Hook)**

Does your app collect data from Nigerian users?

The NDPA 2023 requires 8 compliance areas: consent, DSR, DPIA, breach notification, privacy policy, lawful basis, cross-border transfers, and ROPA.

I built an open-source React toolkit that handles all 8. Here's what it does:

---

**Tweet 2 (Consent)**

1/ Consent banner in one line:

```tsx
import { NDPRConsent } from '@tantainnovative/ndpr-toolkit/presets';

<NDPRConsent />
```

Purpose-specific consent, withdrawal mechanism, audit trail, version tracking. NDPA Sections 25-26 compliant out of the box.

---

**Tweet 3 (Compliance Score)**

2/ Not sure where you stand? Run a compliance score:

The scoring engine evaluates all 8 NDPA modules and tells you exactly what to fix, sorted by enforcement risk.

Consent and breach notification are weighted highest because the NDPC enforces them most.

---

**Tweet 4 (Architecture)**

3/ Architecture built for real projects:

- 14 tree-shakeable entry points
- Works with ANY CSS framework
- Pluggable storage (localStorage, cookies, API, compose)
- 584 tests, full TypeScript
- React 16.8 through 19

Import only what you need. Your bundle stays small.

---

**Tweet 5 (Stakes)**

4/ Why this matters:

Multichoice Nigeria: N766M fine (cross-border transfers)
Fidelity Bank: under investigation
NDPC fines: up to 2% of annual revenue or N10M

This is not theoretical. The NDPC is actively enforcing.

---

**Tweet 6 (CTA)**

5/ It's free and open source:

npm: @tantainnovative/ndpr-toolkit
GitHub: github.com/mr-tanta/ndpr-toolkit
Docs: ndprtoolkit.com.ng

Full guide with code examples for all 8 modules:
ndprtoolkit.com.ng/blog/complete-guide-ndpa-compliance-react-nextjs

Star it if it helps. RT to help other Nigerian devs find it.

---

# LinkedIn Post

> Shorter, more professional tone. Include the npm link.

---

I shipped an open-source compliance toolkit for the Nigeria Data Protection Act (NDPA) 2023.

If your application collects personal data from anyone in Nigeria, the NDPA applies to you. The penalties are significant -- Multichoice was fined N766 million last year for cross-border transfer violations alone.

The NDPA Toolkit handles all 8 compliance areas:

- Consent management (Sections 25-26)
- Data subject rights portal (Sections 34-39)
- DPIA questionnaire (Section 28)
- Breach notification workflow (Section 40)
- Privacy policy generator (Section 29)
- Lawful basis tracker (Section 25)
- Cross-border transfer manager (Sections 43-44)
- Record of Processing Activities (Section 30)

It's a React component library with 14 tree-shakeable entry points, 584 tests, full TypeScript support, pluggable storage adapters, and zero-config presets for teams that need to move fast.

The compliance score engine evaluates your posture across all 8 modules and tells you exactly what to fix, sorted by NDPC enforcement risk.

Free. MIT licensed. Works with React 16.8-19, Next.js, and any CSS framework.

npm: https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit
GitHub: https://github.com/mr-tanta/ndpr-toolkit
Documentation: https://ndprtoolkit.com.ng

I wrote a complete implementation guide with working code for every module: https://ndprtoolkit.com.ng/blog/complete-guide-ndpa-compliance-react-nextjs

If you work with Nigerian data or know someone who does, I'd appreciate a share.

#NDPA #DataProtection #Nigeria #React #NextJS #OpenSource #Compliance #Privacy
