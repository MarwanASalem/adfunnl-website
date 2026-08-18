# What AdFunnl actually does

**Last checked against the app: 18 August 2026.**

This is the list of what the website is allowed to claim. It exists because the
website repo and the app repo are not connected in any way: nothing here updates
itself, and nothing in the app tells this file that it changed.

## How to use this file

**Writing copy?** Read this first. If a capability is not on this list, do not
put it on the website. If you think it should be here, go and check the app, then
add it with the date you checked.

**Shipped something new?** Tell me the feature and I will verify it in the app
and add it. Or say "refresh what-ships" and I will re-read the app repo and
update this whole file.

**Refreshing the app copy on this machine** (it is a snapshot, it goes stale):

```bash
git -C "C:/Claude Code & Codex/AdFunnl" pull
```

Facts come from the app repo at `../AdFunnl`, mainly `ARCHITECTURE.md`,
`BACKLOG.md`, the page list in `web/src/pages/`, and `api/config/routes.rb`.
Those files are the app's own documentation, so they beat anybody's memory,
including mine and the marketing copy in `adfunnl-landing-copy.md`.

---

## Connect

| Capability | Notes |
|---|---|
| Meta | Insights, ad level, breakdowns, campaign control, billing |
| TikTok | Insights, ad level, campaign control |
| Snapchat | Insights only |
| Google Ads | Insights only |
| Shopify | Products and daily product sales, powers product-level ROAS |
| Salla | Orders and revenue |
| Bosta | Daily fulfilment snapshot |
| Easy Orders | Orders |
| Google Sheets | Manual import as a data source, one direction, in only |
| Sync cadence | Hourly. Full backfill of 90 days on a new account, last 3 days re-fetched every sync for late conversions |
| Currency | Everything unified into one reporting currency at the right rate |

## Visualize

| Capability | Notes |
|---|---|
| Dashboard builder | Freeform drag-and-drop canvas, not a fixed template |
| Widgets | KPI tiles, charts, tables, funnels, geo maps, timelines, creative galleries, product ROAS |
| Versus prior period | Comparison on any tile, month over month inline |
| Custom metrics | Plus conditional table rules and change annotations dated to what changed |
| Templates | Save a layout personally or app-wide, then clone it across accounts |
| Blended totals | Cross-platform blended ROAS, spend, purchases and revenue |
| Product-level ROAS | Store revenue attributed down to product and category |
| Creative analysis | Best Creatives ranked by a metric you choose, with the thumbnails in the page. Ad level is Meta and TikTok only |
| Ad fatigue | Tracked across every ad platform |
| Hook and hold | Video retention, where viewers drop off |
| Pulse | Watches accounts against your rules and flags them Scale, Hold or Cut |
| Funding and status alerts | Balance and threshold monitoring, emailed when an account is at risk |
| Arabic | Full bilingual English and Arabic with RTL, charts included |

## Share

| Capability | Notes |
|---|---|
| Live share links | View-only, token-gated, current whenever the client opens them |
| Report snapshots | Frozen copy of what you sent, so last month cannot move |
| PDF export | Clean paginated PDFs, for dashboards and for creative analysis |
| Creative share links | Share the creative analysis view on its own |
| Client logo | The client's own logo renders on their dashboard and report |
| Looker Studio | Community connector, reads workspace data with an API token |
| Digest view | An in-app read-only page mirroring a dashboard one to one |

## Ask

| Capability | Notes |
|---|---|
| In-app assistant | On every page, natural language, streamed answers that show the data used, per-workspace memory |
| MCP server | Claude, ChatGPT or any MCP client can query the same unified data |
| AI credits | Assistant usage runs on a per-workspace credit balance |

## Trust

| Capability | Notes |
|---|---|
| Methodology page | Published, shows how every metric is calculated |
| Data Logs and Sync Jobs | When each account last updated, and whether it worked |
| Client isolation | Server-enforced, scoped by workspace then client |

## Team

| Capability | Notes |
|---|---|
| Workspaces | The tenant. A user can belong to several |
| Invites and roles | Invite by email. Roles are owner, admin, member |
| Clients | A named group of ad accounts. An ad account belongs to at most one client |
| Multiple workspaces | Brand workspaces have no client layer, agency workspaces do |

---

## Do not claim these

Things that sound true, or that our own older marketing copy claims, and are
not built. Each one has been checked.

| Claim | Reality |
|---|---|
| **Performance per media buyer** | There is no media buyer dimension anywhere in the product. Grouping is Workspace, then Client, then Ad Account. Every member sees every client, and per-member client permissions are explicitly listed as not existing yet. Write the hierarchy as the reader's *pain*, never as a view they will get |
| **Your agency's branding on reports** | Only the **client's** logo is supported. Agency white-labelling is a candidate in `BACKLOG.md`, not shipped |
| **Scheduled email report digests** | The app sends no report emails at all. Its only emails are account and billing ones: welcome, password reset, verification, invitation, plan approved, credits added, trial ending, billing alerts. The Digest page is an in-app view, not a mailout. This was on the Team Leads page and has been removed |
| **Pushing data out to warehouses or Sheets** | No push adapters exist. The tables were designed for it and the code was never written. Data out is pull-only: Looker Studio and share links. Google Sheets is import only |
| **Campaign control on Snapchat or Google** | Changing status and budget from inside AdFunnl is Meta and TikTok only. The site already says the other two are in progress, which is correct |
| **Any customer name, testimonial, or measured result** | We have published none. Not a capability question, a standing rule |
