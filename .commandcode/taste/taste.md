# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# api
- API service paths must NOT include the `api/v1/` prefix — the `apiClient` already handles it via `prefix: BASE_URL`. All services (auth, workspace, subscription, accounting) use bare paths like `accounts`, `auth/register`, etc. Confidence: 0.70
- For `X-Workspace-ID` header, use `workspace.entity_id` from `listWorkspaces` response, NOT `workspace.id` (which is the relation ID from `entity_relations` table). Confidence: 0.85

# ui
- Do NOT use `avoidCollisions={false}` on Radix SelectContent — it causes dropdowns to overflow past the viewport. Use default collision avoidance (or `avoidCollisions={true}`) so Radix properly constrains the dropdown within the screen boundary. Confidence: 0.65
- Always show a confirmation dialog before destructive or state-changing actions (e.g., deactivate, activate, delete, toggle). Do not execute the mutation directly on click. Confidence: 0.75
- For the accounts (COA) page: always fetch with `?include_inactive=true` query parameter and display all accounts including inactive ones by default — no toggle/filter UI to hide them. Confidence: 0.70
- Format nominal/currency input fields with dot (.) as thousands separator in UI only (e.g., 3000000 → 3.000.000); send raw number to backend. For Rupiah (IDR) currency, prepend "Rp" prefix. Formatting must be live/real-time while user types — NOT only on blur. Confidence: 0.80

# accounting
- For SIMPLE mode transactions, do NOT include `journal_entries` in the API payload at all — only ADVANCED mode sends journal entries. Filter out empty/default journal entries before sending to backend. Confidence: 0.70
- Send `amount` as a JSON number (not string) in transaction API payloads — backend expects `pgtype.Numeric` which decodes from JSON number. Confidence: 0.70
- Send `unit_price` as a JSON number (not string) in item API payloads — same issue as `amount`: backend expects `pgtype.Numeric`. Confidence: 0.70
- The `unit` field in item payloads must use PascalCase to match backend enum validation (e.g., `"Pcs"` not `"pcs"`, `"Kg"` not `"kg"`, `"Box"` not `"box"`). Confidence: 0.75
- For item deactivation, use `DELETE /items/{id}` (not PATCH with `is_active`). For reactivation, use `POST /items/{item_id}/reactivate`. Items use dedicated delete/reactivate endpoints, not field toggling. Confidence: 0.65

