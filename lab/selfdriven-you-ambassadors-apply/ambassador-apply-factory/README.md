# ambassador-apply

Captures selfdriven.you ambassador applications, stores each as a JSON object in S3,
and publishes a prose SNS alert per application. Built as an entityOS factory.
Endpoint is an API Gateway REST API behind an AWS WAF rate limit.

```
ambassador-apply/
├── lambda/
│   ├── infrastructurefactory-ambassador-apply.js   request handling (route, validate, save, notify)
│   ├── index.js                                     handler bootstrap (Promise bridge)
│   ├── package.json
│   └── events/                                      lambda-local test events
└── deploy/
    ├── infrastructurefactory-ambassador-apply.js   deploy pipeline (S3 → SNS → IAM → Lambda → API GW → WAF)
    ├── deploy.js                                    pipeline entry point
    ├── settings.json                                deploy config + credentials
    └── package.json
```

## Deploy

```bash
cd deploy
npm install
npm run deploy          # prompts for AWS access id/secret (settings.json "prompt" sentinel)
```

Idempotent — re-running updates code/config/policy in place. On success it prints the
**API endpoint**; set that as `ENDPOINT` in the `/ambassadors` page.

## What it provisions (14 steps)

1–2. Deploy bucket (holds the zipped release)
3–4. Applications bucket — private, AES-256, versioned
5.   SNS topic `ambassador-apply-alerts` (idempotent); subscribes `notifyEmail` if set
6–7. Zip + upload release
8–9. IAM role — basic execution + inline policy: `s3:PutObject` on `applications/*` and `sns:Publish` to the topic only
10–11. Lambda (Node 20) with env `APPLICATIONS_BUCKET`, `APPLICATIONS_PREFIX`, `ALLOWED_ORIGIN`, `SNS_TOPIC_ARN`
12–13. API Gateway REST API, `ANY /` → Lambda proxy, deployed to the `live` stage
14.  WAF WebACL (REGIONAL) with a rate-based rule, associated with the API stage

> WAF is used via a **REST API** because AWS WAF cannot attach to HTTP APIs (v2) or
> Function URLs. There is no public Function URL — the only entry point is the
> WAF-protected API Gateway stage.

## Endpoint contract

`POST` JSON `{ name, email, location, settings[], mode, why, hours }`
→ `200 { ok: true, ref: "AMB-XXXXX" }` | `400 { ok:false, error }` | `500 { ok:false, error }`
`OPTIONS` → `204` (CORS preflight, served by the Lambda)

## Application records

`s3://selfdriven-ambassador-applications/applications/YYYY/MM/AMB-XXXXX.json`
(`ref` and `email` also set as S3 object metadata).

## Alerts

Each saved application publishes a readable SNS message (subject + prose body with the
applicant's details and the S3 location). Set `deploy.notifyEmail` in settings.json to
auto-subscribe an address — the recipient must click the SNS confirmation email once.
Alert failure never fails the request: the application is already saved.

## Key settings (settings.json → deploy)

| Key | Default | Notes |
|---|---|---|
| `notifyEmail` | `""` | Email to subscribe to alerts (empty = none) |
| `apiStage` | `live` | API Gateway stage name |
| `wafRateLimit` | `300` | Blocked above this many requests / 5 min / IP (min 100) |
| `allowedOrigin` | `https://selfdriven.you` | CORS origin returned by the Lambda |

## Local test (before deploy)

```bash
cd lambda
npm install
APPLICATIONS_BUCKET=some-bucket npm run invoke:post   # SNS skipped unless SNS_TOPIC_ARN set
```
