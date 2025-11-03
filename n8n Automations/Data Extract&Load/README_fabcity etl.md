# fabcity etl

Source file: `n8n Automations/fabcity etl.json`

Summary:

This workflow (named "fabcity etl") is an ETL-style n8n workflow that:

- Searches Airtable for records with Status = "Published" (Airtable node).
- Formats / normalizes URLs (custom Code node `format_url`) to classify URLs as `file` or `folder` and normalize Google Drive file links to direct-download links.
- Has a manual trigger for execution and splits items into batches for sub-workflow execution.
- Executes another workflow (`etl`) for each batch (Execute Workflow node) and includes custom JavaScript code nodes for filtering/formatting.

Nodes (brief):

- `When clicking ‘Execute workflow’` (manual trigger): start the workflow manually.
- `Search records` (Airtable): searches app `appP4LlfPgZFhhqdj`, table `Submissions` with filter `{Status}= 'Published'`.
- `format_url` (Code): custom JS to classify and normalize URLs. Key behavior:
  - Detects Google Drive folder links and marks `url_type: 'folder'`.
  - Detects Google Drive file links and normalizes them to `https://drive.google.com/uc?export=download&id=<fileId>` with `url_type: 'file'`.
  - Falls back to a regex that checks for the word "folder" to classify unknown links.
  - Emits separate items for `Resource URL` and `Canonical File Path` fields while preserving the original Airtable record data.
- `Code` (Code): small filter/sample code that searches for a specific YouTube URL pattern (example filter).
- `Loop Over Items` (SplitInBatches): batches items (batchSize: 5) and controls flow to `Execute Workflow`.
- `Execute Workflow`: runs the `etl` workflow for each batch (waits for sub-workflow completion).

Active: false (workflow is currently not active in the JSON file).

Notes / quick suggestions:

- The `format_url` code is well-commented and safe; keep a test run on a subset of records before enabling.
- If you want to preserve the original Google Drive link as well as the normalized one, consider adding a `normalized_url` field instead of overwriting `url`.

---

If you want different filename/structure (for example `README.md` plus `DETAILS.md`) or want the markdown to include full node JSON, tell me and I can add it.