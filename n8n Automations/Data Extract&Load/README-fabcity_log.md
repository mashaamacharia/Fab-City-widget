# fabcity_log

Source file: `n8n Automations/fabcity_log.json`

Summary:

This workflow (named "fabcity_log") is a simple logging webhook that:

- Exposes a `POST` webhook endpoint (node `Webhook`) with path `cfb922b5-3f55-4ccf-94c2-6b83e10d37b9`.
- Receives JSON payloads containing session logging information and appends/updates rows in a Google Sheet (`Append or update row in sheet`).
- The Google Sheets node maps the following columns from the webhook `body`:
  - `sessionId`, `domain`, `totalMessages`, `conversation`, `timestamp` and also includes fields for `headers`, `params`, `query`, `body`, `webhookUrl`, `executionMode` in the sheet schema.

Nodes (brief):

- `Webhook` (Webhook): listens for POST requests. WebhookId: `cfb922b5-3f55-4ccf-94c2-6b83e10d37b9`.
- `Append or update row in sheet` (Google Sheets): appends or updates rows in a Google Sheet with document ID `1ZSFfAwcdXJ68xQ7giYI5HHNNBKtcD2RE2A-xhkagW0E` (sheet `gid=0`). Maps webhook body fields to sheet columns and uses `sessionId` as the matching column.

Active: true (workflow is active in the JSON file).

Example webhook payload (excerpt included in JSON):
- `sessionId`: `session_1761677623870_rlbs3y8oh`
- `domain`: `localhost`
- `totalMessages`: 6
- `conversation`: an array of message objects with `id`, `text`, `sender`, `timestamp`.
- `timestamp`: `2025-10-28T18:56:59.806Z`

Notes / quick suggestions:

- Because the webhook writes rich structured data (including `conversation` array), make sure the target sheet column types accommodate long JSON strings or consider storing the `conversation` in a separate sheet/tab or as a compressed/stringified value.
- Verify the Google Sheets credentials (`ndunguisaac`) and the sheet access before enabling wide traffic to the webhook.

---

If you'd like I can also add an OpenAPI-style example request/response or expand to include full node JSON dumps in the markdown for documentation/searchability.