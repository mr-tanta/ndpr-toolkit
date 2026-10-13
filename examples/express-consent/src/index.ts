import express, { type NextFunction, type Request, type Response } from 'express';
import {
  validateConsentStructured,
  type ConsentSettings,
} from '@tantainnovative/ndpr-toolkit/server';

const app = express();
const port = Number(process.env.PORT) || 3000;

// Consent payloads are small; cap the body explicitly rather than relying on the default.
app.use(express.json({ limit: '16kb' }));

app.post('/consent', (req, res) => {
  if (
    req.body === null ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body)
  ) {
    return res.status(400).json({
      error: 'A JSON object is required.',
    });
  }

  const { valid, errors, data } = validateConsentStructured(
    req.body as ConsentSettings,
  );

  if (!valid || !data) {
    return res.status(400).json({
      error: 'Validation failed.',
      errors,
    });
  }

  return res.status(201).json({
    success: true,
    consent: data,
  });
});

// Malformed or oversized JSON reaches here from express.json(). Return a JSON
// error instead of Express's default HTML page, which includes a stack trace.
app.use((err: Error & { type?: string; status?: number }, _req: Request, res: Response, next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  return next(err);
});

app.listen(port, () => {
  console.log(`Express consent example running on http://localhost:${port}`);
});
