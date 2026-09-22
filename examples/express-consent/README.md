# Express Consent Example

A minimal Express + TypeScript example showing how to validate consent
payloads with `validateConsentStructured` from the React-free
`@tantainnovative/ndpr-toolkit/server` entry.

## Run

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The server runs at:

```text
http://localhost:3000
```

## API

### `POST /consent`

The endpoint validates the request body using
`validateConsentStructured`.

A valid request returns the validated consent data.

An invalid request returns a `400` response with structured validation
errors.

### Valid request

```json
{
  "consents": {
    "essential": true,
    "analytics": false,
    "marketing": false
  },
  "timestamp": 1780000000000,
  "version": "1.0.0",
  "method": "banner",
  "hasInteracted": true
}
```

Example with `curl`:

```bash
curl -X POST http://localhost:3000/consent \
  -H "Content-Type: application/json" \
  -d '{
    "consents": {
      "essential": true,
      "analytics": false,
      "marketing": false
    },
    "timestamp": 1780000000000,
    "version": "1.0.0",
    "method": "banner",
    "hasInteracted": true
  }'
```

Successful response:

```json
{
  "success": true,
  "consent": {
    "consents": {
      "essential": true,
      "analytics": false,
      "marketing": false
    },
    "timestamp": 1780000000000,
    "version": "1.0.0",
    "method": "banner",
    "hasInteracted": true
  }
}
```

### Invalid request

This request is missing the required consent options and version:

```json
{
  "consents": {},
  "timestamp": 1780000000000,
  "version": "",
  "method": "banner",
  "hasInteracted": true
}
```

Example with `curl`:

```bash
curl -X POST http://localhost:3000/consent \
  -H "Content-Type: application/json" \
  -d '{
    "consents": {},
    "timestamp": 1780000000000,
    "version": "",
    "method": "banner",
    "hasInteracted": true
  }'
```

The endpoint returns `400` with structured validation errors:

```json
{
  "error": "Validation failed.",
  "errors": [
    {
      "field": "consents",
      "code": "consents_required",
      "message": "Consent settings must include at least one consent option"
    },
    {
      "field": "version",
      "code": "version_required",
      "message": "Consent version is required"
    }
  ]
}
```

## What this example demonstrates

- Express request handling
- TypeScript integration
- Server-side consent validation
- `validateConsentStructured` from the `/server` entry
- Structured validation errors
- Returning validated consent data from an API endpoint
