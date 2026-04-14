'use client';

import Link from 'next/link';
import { DocLayout } from '@/components/docs/DocLayout';

export default function BackendIntegrationGuide() {
  return (
    <DocLayout
      title="Backend Integration"
      description="Persist consent, DSR submissions, and breach reports to a database using @tantainnovative/ndpr-recipes"
    >
      <section id="introduction" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Overview of ndpr-recipes</h2>
        <p className="mb-4 text-foreground">
          <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">@tantainnovative/ndpr-recipes</code> is an optional companion package that provides pre-built backend
          glue code — Prisma adapters, Next.js API route handlers, Express middleware, and a CLI scaffolder — so you
          can connect the frontend toolkit to a real database in minutes rather than hours.
        </p>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`pnpm add @tantainnovative/ndpr-recipes
# or
bun add @tantainnovative/ndpr-recipes`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">The package has peer dependencies on the main toolkit:</p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`{
  "peerDependencies": {
    "@tantainnovative/ndpr-toolkit": ">=3.0.0",
    "@prisma/client": ">=5.0.0"    // optional — only if you use Prisma adapters
  }
}`}</code></pre>
        </div>
      </section>

      <section id="prisma-setup" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Setting Up Prisma</h2>
        <p className="mb-4 text-foreground">
          The recipes package ships a Prisma schema fragment with tables for consent records, DSR submissions, and
          breach reports. Copy it into your project&apos;s <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">prisma/schema.prisma</code> and run a migration.
        </p>

        <h3 className="text-xl font-bold text-foreground mb-3">Step 1: Copy the schema fragment</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// prisma/schema.prisma  (append to your existing schema)

model ConsentRecord {
  id          String   @id @default(cuid())
  userId      String?
  sessionId   String
  consents    Json     // { analytics: true, marketing: false, ... }
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([sessionId])
}

model DSRSubmission {
  id              String   @id @default(cuid())
  requestType     String   // access | erasure | portability | rectification | objection | restriction
  fullName        String
  email           String
  details         String
  status          String   @default("pending")  // pending | in_progress | completed | rejected
  acknowledgedAt  DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([email])
  @@index([status])
}

model BreachReport {
  id              String   @id @default(cuid())
  severity        String   // low | medium | high | critical
  description     String
  affectedCount   Int?
  detectedAt      DateTime
  reportedAt      DateTime?
  ndpcNotified    Boolean  @default(false)
  status          String   @default("open")  // open | contained | resolved
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Step 2: Run the migration</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`pnpx prisma migrate dev --name add-ndpr-tables`}</code></pre>
        </div>
      </section>

      <section id="prisma-adapters" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Using Prisma Adapters with Toolkit Hooks</h2>
        <p className="mb-4 text-foreground">
          After migrations are applied, import the Prisma adapter factories from <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">ndpr-recipes</code> and pass
          them to your toolkit hooks exactly as you would with the built-in adapters.
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/lib/ndpr-adapters.ts
import { PrismaClient } from '@prisma/client';
import {
  createPrismaConsentAdapter,
  createPrismaDSRAdapter,
  createPrismaBreachAdapter,
} from '@tantainnovative/ndpr-recipes/prisma';

const prisma = new PrismaClient();

export const consentAdapter = createPrismaConsentAdapter(prisma, {
  // Provide a user / session identifier at request time
  getUserId: () => null,          // replace with your auth helper
  getSessionId: () => crypto.randomUUID(),
});

export const dsrAdapter = createPrismaDSRAdapter(prisma);
export const breachAdapter = createPrismaBreachAdapter(prisma);`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">Use the adapters in your components:</p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { Consent } from '@tantainnovative/ndpr-toolkit';
import { consentAdapter } from '@/lib/ndpr-adapters';

export function ConsentBanner() {
  return (
    <Consent.Provider
      categories={categories}
      adapter={consentAdapter}
    >
      <Consent.Banner position="bottom">
        <Consent.Title>Cookie preferences</Consent.Title>
        <Consent.CategoryList />
        <div className="flex gap-3 mt-4">
          <Consent.AcceptAllButton />
          <Consent.RejectAllButton />
        </div>
      </Consent.Banner>
    </Consent.Provider>
  );
}`}</code></pre>
        </div>
      </section>

      <section id="nextjs-routes" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Next.js API Routes</h2>
        <p className="mb-4 text-foreground">
          The recipes package exports ready-made Next.js App Router handlers for consent, DSR, and breach endpoints.
          Mount them by re-exporting from your route files:
        </p>

        <h3 className="text-xl font-bold text-foreground mb-3">Consent API</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/app/api/consent/route.ts
import { createConsentHandler } from '@tantainnovative/ndpr-recipes/nextjs';
import { prisma } from '@/lib/prisma';

const { GET, POST } = createConsentHandler({ prisma });
export { GET, POST };`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">DSR API</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/app/api/dsr/route.ts
import { createDSRHandler } from '@tantainnovative/ndpr-recipes/nextjs';
import { prisma } from '@/lib/prisma';
import { sendAcknowledgementEmail } from '@/lib/email';

const { GET, POST } = createDSRHandler({
  prisma,
  onSubmit: async (submission) => {
    // Triggered after the record is saved
    await sendAcknowledgementEmail({
      to: submission.email,
      requestType: submission.requestType,
      referenceId: submission.id,
    });
  },
  onStatusChange: async (submission) => {
    // Triggered when status is updated via PATCH
    await sendStatusUpdateEmail(submission);
  },
});

export { GET, POST };`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Breach notification API</h3>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/app/api/breach/route.ts
import { createBreachHandler } from '@tantainnovative/ndpr-recipes/nextjs';
import { prisma } from '@/lib/prisma';

const { GET, POST, PATCH } = createBreachHandler({
  prisma,
  onReport: async (report) => {
    if (report.severity === 'critical') {
      // Alert your security team immediately
      await notifySecurityTeam(report);
    }
  },
});

export { GET, POST, PATCH };`}</code></pre>
        </div>

        <p className="mb-4 text-foreground">
          The <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">apiAdapter</code> from the main toolkit will point to these endpoints automatically
          when you configure it with the matching <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">baseUrl</code>:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`import { apiAdapter } from '@tantainnovative/ndpr-toolkit';

const consentAdapter = apiAdapter({ baseUrl: '/api/consent' });
const dsrAdapter     = apiAdapter({ baseUrl: '/api/dsr' });`}</code></pre>
        </div>
      </section>

      <section id="express-routes" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Express Routes</h2>
        <p className="mb-4 text-foreground">
          For non-Next.js Node.js backends, use the Express router factory:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/routes/ndpr.ts
import express from 'express';
import {
  createConsentRouter,
  createDSRRouter,
  createBreachRouter,
} from '@tantainnovative/ndpr-recipes/express';
import { prisma } from '../lib/prisma';

const router = express.Router();

router.use('/consent', createConsentRouter({ prisma }));
router.use('/dsr',     createDSRRouter({ prisma }));
router.use('/breach',  createBreachRouter({ prisma }));

export default router;`}</code></pre>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`// src/app.ts
import express from 'express';
import cors from 'cors';
import ndprRouter from './routes/ndpr';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/ndpr', ndprRouter);

// Routes exposed:
// POST /api/ndpr/consent
// GET  /api/ndpr/consent/:key
// POST /api/ndpr/dsr
// GET  /api/ndpr/dsr/:id
// POST /api/ndpr/breach
// PATCH /api/ndpr/breach/:id`}</code></pre>
        </div>
      </section>

      <section id="cli-scaffolder" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">The create-ndpr CLI Scaffolder</h2>
        <p className="mb-4 text-foreground">
          Run the scaffolder to bootstrap an entire NDPA-compliant Next.js app — including routes, pages, Prisma schema,
          environment variable templates, and example tests — in a single command:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`npx create-ndpr@latest`}</code></pre>
        </div>
        <p className="mb-4 text-foreground">
          The interactive CLI will ask a few questions and then scaffold the chosen features:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`? Project name: my-app
? Framework: Next.js (App Router)
? Database: PostgreSQL (Prisma)
? Which modules would you like? (space to toggle)
  ✓ Consent management
  ✓ Data subject rights (DSR)
  ✓ Breach notification
  ○ DPIA questionnaire
  ✓ Privacy policy generator
  ○ ROPA

? Include example tests? Yes
? Install dependencies now? Yes

✓ Scaffold complete!
  → src/app/api/consent/route.ts
  → src/app/api/dsr/route.ts
  → src/app/api/breach/route.ts
  → src/app/privacy-policy/page.tsx
  → src/app/data-rights/page.tsx
  → prisma/schema.prisma (NDPR tables added)
  → .env.example
  → __tests__/consent.test.ts
  → __tests__/dsr.test.ts`}</code></pre>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-3">Adding modules to an existing project</h3>
        <p className="mb-4 text-foreground">
          Use the <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">--add</code> flag to scaffold just the files you need into an existing codebase:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`npx create-ndpr@latest --add dsr --add breach --framework nextjs`}</code></pre>
        </div>
      </section>

      <section id="environment-variables" className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">Environment Variables</h2>
        <p className="mb-4 text-foreground">
          The scaffolder generates a <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.env.example</code> file. Copy it to <code className="bg-card border border-border px-1.5 py-0.5 rounded text-sm">.env.local</code> and fill in your values:
        </p>
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto mb-4">
          <pre className="text-foreground"><code>{`# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp_dev"

# Optional: email notifications for DSR acknowledgements
NDPR_EMAIL_FROM="privacy@myapp.ng"
NDPR_EMAIL_PROVIDER="resend"    # resend | sendgrid | nodemailer
RESEND_API_KEY="re_..."

# Optional: NDPC submission endpoint (future)
NDPC_API_KEY=""`}</code></pre>
        </div>
      </section>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/guides/adapters" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Storage Adapters &rarr;
          </Link>
          <Link href="/docs/guides/data-subject-requests" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Handling Data Subject Requests &rarr;
          </Link>
          <Link href="/docs/guides/breach-notification-process" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            Breach Notification Process &rarr;
          </Link>
        </div>
      </div>
    </DocLayout>
  );
}
