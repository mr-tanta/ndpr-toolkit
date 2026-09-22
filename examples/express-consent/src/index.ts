import express from 'express';
import {
  validateConsentStructured,
  type ConsentSettings,
} from '@tantainnovative/ndpr-toolkit/server';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.post('/consent', (req, res) => {
  const { valid, errors, data } = validateConsentStructured(
    req.body as ConsentSettings,
  );

  if (!valid || !data) {
    return res.status(400).json({
      error: 'Validation failed.',
      fields: Object.fromEntries(
        errors.map((error) => [error.field, error.message]),
      ),
    });
  }

  return res.status(201).json({
    success: true,
    consent: data,
  });
});

app.listen(port, () => {
  console.log(`Express consent example running on http://localhost:${port}`);
});
