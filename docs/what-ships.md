# What AdFunnl actually does

**Last checked against the app: 18 August 2026. Ad control checked 14 October 2026, Google and audiences rechecked 21 October 2026.**

This is the list of what the website is allowed to claim. It exists because the
website repo and the app repo are not connected in any way: nothing here updates
itself, and nothing in the app tells this file that it changed.

## How to use this file

**Writing copy?** Read this first. If a capability is not on this list, do not
put it on the website. If you think it should be here, go and check the app, then
add it with the date you checked.

**Not live yet?** The reasons this file gives (an approval, an API gap, invite
only) are for writers, never for the page. On the site an unreleased
connector is only "Coming soon", greyed out in its own group.

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
| Snapchat | Insights. Campaign control only from Claude or ChatGPT (ad control, under Ask) |
| Google Ads | Insights. On and off and budgets only from Claude or ChatGPT (ad control, under Ask) |
| Shopify | Products and daily product sales, powers product-level ROAS |
| Salla | Orders and revenue. **Coming soon in the app, not connectable**: the tile is greyed with a "Coming soon" pill since 25 September 2026 (`web/src/lib/beta.ts`, `COMING_SOON_SOURCES`). Checked 21 October 2026 |
| Zid | Daily store revenue over OAuth, same shape as Salla. **Coming soon in the app, not connectable**, same as Salla. Checked 21 October 2026 in `web/src/lib/beta.ts` |
| Bosta | Daily fulfilment snapshot. Beta pill in the app |
| Shopify status | Beta pill in the app (`BETA_SOURCES`). Checked 21 October 2026 |
| Easy Orders | Orders. **Coming soon, not connectable**: the connector exists but is hidden from the Connections page since 19 June 2026, until their API has a bulk orders endpoint. The owner counts it as coming soon, not dropped (21 October 2026). Write it with Salla and Zid under "coming next". Checked 21 October 2026 |
| Google Sheets | Manual import as a data source, one direction, in only |
| LinkedIn Ads, Google Analytics, HubSpot | **Invite-only betas** behind feature flags, not open to everyone. LinkedIn: campaign results, waiting on LinkedIn's API approval. Google Analytics (GA4): sessions and on-site results, waiting on Google's verification of the analytics scope. HubSpot: newsletter subscribers and per-send performance. Write them as "coming next" only. Checked 21 October 2026 in `api/lib/connectors/` and `ConnectionsPage.tsx` |
| Sync cadence | Set by the plan: every 12 hours on Free and Solo, 6 on Growth, hourly on Agency (`refresh_window_hours` in `api/app/models/plan_config.rb`, checked 21 October 2026). Full backfill of 90 days on a new account, last 3 days re-fetched every sync for late conversions |
| Currency | Everything unified into one reporting currency. The rate is the current market rate, refreshed every few hours, not the rate on the day of spend. A dashboard's settings let you set your own rate per currency instead. Checked 15 October 2026 in `api/lib/currency_conversion_service.rb` and `web/src/components/builder/DashboardSettingsDrawer.tsx` (`rate_overrides`) |

## Visualize

| Capability | Notes |
|---|---|
| Dashboard builder | Freeform drag-and-drop canvas, not a fixed template |
| AI dashboard builder | Ask for a dashboard and it gets built. Two-phase and never silent: the first call returns a plan (the sections, the widget list, the goal it assumed, and caveats naming the panels that would come back empty) and it only builds after you approve that plan. A goal-built dashboard is sectioned: an Overview with a KPI row per ad platform over a blended row, plus a store row when one is connected, then Performance over time, Campaigns, Geography, Demographics and Placement. Shaped around what the brand has actually connected. Available to the in-app assistant and to any MCP client, so it needs a plan that includes AI. Checked 22 September 2026 in `api/app/services/analytics/tool_registry.rb` (`create_dashboard`, `update_dashboard`) and `api/app/services/chat_assistant.rb` |
| Widgets | KPI tiles, charts, tables, funnels, geo maps, timelines, creative galleries, product ROAS |
| Versus prior period | Comparison on any tile, month over month inline |
| Custom metrics | Plus conditional table rules and change annotations dated to what changed |
| Templates | Save a layout personally or app-wide, then clone it across accounts |
| Blended totals | Cross-platform blended ROAS, spend, purchases and revenue. The blended ROAS preset is platform-reported revenue over ad spend (`ads.revenue / ads.spend`). A second preset, store ROAS, is store revenue over ad spend (`stores.revenue / ads.spend`), so both can sit side by side. Checked 15 October 2026 in `web/src/lib/custom-metric-presets.ts` |
| Product-level ROAS | Store revenue attributed down to product and category |
| Creative analysis | Best Creatives, with the creative itself in the page. Ranked by a composite score, not one metric: ecommerce mode weights ROAS 40%, cost per purchase 40% and outbound CTR 20%, each standardised across the ads currently in view. Messaging mode is Meta only and weights cost per message 80%, CTR 20%. Ad level is **Meta and Snapchat**, several accounts at once. Checked 19 August 2026 in `web/src/lib/creative-score.ts` and `web/src/pages/BestCreativesPage.tsx` |
| Creative filters | Minimum spend threshold, defaulting to the average spend across the ads in view, so low-spend noise drops out of the ranking. Plus filters on platform, campaign and objective, a date range, list or grid view, and a one-click PDF of the page. Checked 19 August 2026 |
| Audience breakdowns | Breakdown widgets (donut, bar, table, geo map) by age, gender, device, country, region, placement and day of week, summed across every account and campaign in view. **Meta and Snapchat only.** Meta has all of them; Snapchat has gender, age, country and region, no device. TikTok and Google bring in no breakdowns. Checked 10 September 2026 in `web/src/lib/builder-types.ts` (`BREAKDOWN_DIMENSIONS`), `api/lib/connectors/meta.rb` and `api/lib/connectors/snapchat.rb` |
| Ad fatigue | Tracked across every ad platform. Confirmed 19 August 2026: Meta, TikTok, Snapchat and Google |
| Hook and hold | Video retention, where viewers drop off. **Meta only.** Checked 19 August 2026 in `web/src/pages/HookHoldRatesPage.tsx` |
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
| Ad control (changing ads from Claude or ChatGPT) | Over MCP. Every change is two-phase: the first call changes nothing and returns a plan, and only a second call after the user approves it applies it. An applied change lands in the brand's Change Log. Included on paid Growth and Agency, a Solo add-on (EGP 500 / $10) on top of the AI add-on (EGP 390 / $8), never on a trial. Checked 14 October 2026 in `api/app/services/analytics/ad_management.rb`, `api/app/models/workspace.rb` (`ad_control?`) and `api/app/models/plan_config.rb` (`ADDON_PRICING`) |
| Extra seat add-on | EGP 400 / $8 per seat per month, on Solo (1 seat included) and Growth (3 included). Agency includes 10 seats, beyond that is Enterprise. Requested and approved by the AdFunnl team, not instant checkout. Existing customers granted seats at EGP 300 keep that price (do not mention on the site). Shipped in the app 21 October 2026, figures taken from the app team's brief, not re-read in the app repo |
| Ad control, platform status | Owner's labels, decided 14 October 2026: **TikTok and Snapchat are Live, Meta and Google are Beta.** Use these labels wherever a platform's ad control is named |
| Ad control, every platform | Pause and turn on, and change budgets, on Meta, TikTok, Snapchat and Google. **Google is campaigns only** for both. A budget rise over 50% is held back unless asked for explicitly. Checked 14 October 2026 (`set_ad_status`, `set_ad_budget`, `set_ad_budgets`) |
| Ad control, Meta, TikTok and Snapchat | Duplicate (the copy is always created paused), rename, delete, edit the audience, edit ad text, and set URL tracking tags. Checked 14 October 2026 (`duplicate_ad_item`, `update_ad_item`, `set_ad_url_tags`, `delete_ad_item`, `ITEM_PLATFORMS`) |
| Ad control, new campaigns and ads | TikTok and Snapchat: new campaigns from videos and images on Google Drive, new ad groups or ad sets and new ads added to running campaigns, everything created switched off. TikTok can also run posts already on the profile as ads. Meta: the same tools exist (new campaigns, new ads in an existing ad set, existing Facebook and Instagram posts as ads) but are **early access only**, see "Do not claim". Checked 14 October 2026 in `ad_management/tiktok_creation.rb`, `ad_management/snapchat_creation.rb`, `ad_management/creation.rb` |
| Ad control, Snapchat extras | Catalog ads (with catalog templates) and call ads. Checked 14 October 2026 in `ad_management/snapchat_catalogs.rb` and `snapchat_creation.rb` |
| Ad control, Meta extras | Automated rules, budget schedules, custom and lookalike audiences, custom conversions. Checked 14 October 2026 in `ad_management/automation.rb`, `ad_management/audiences.rb` and `ad_management/account_tools.rb` |
| Ad control, Google | Checked 21 October 2026 in `ad_management/google_creation.rb` and `ad_management/audiences.rb`. New campaigns (all created paused): Search, Shopping, Display, Demand Gen and Performance Max, from the user's own text and Drive images; videos must already be on YouTube. Add ad groups and ads to Search campaigns. Copy Search and Performance Max campaigns. Edit campaign locations, languages, target CPA or ROAS, ad group bids, responsive search ad headlines, descriptions and link. Keywords, negative keywords and search terms. Sitelinks and callouts. Conversion goals. Website-visitor audiences only (no customer lists or lookalikes on Google). Budgets and status stay campaign level |
| Ad control, audiences | Create audiences from Claude or ChatGPT: Meta (custom, lookalike), TikTok (website, ad engagement, lead form, lookalike), Snapchat (website visitors by Snap Pixel, customer lists, lookalikes), Google (website visitors only). Checked 21 October 2026 in `ad_management/audiences.rb`, `tiktok_audiences.rb`, `snapchat_audiences.rb`. Automated rules and budget schedules remain Meta only |
| Ad control, read-only option | The approval screen has a box, "Also allow it to make changes". Untick it and the assistant connects read-only. Checked 14 October 2026 in `api/app/views/doorkeeper/authorizations/new.html.erb` |

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
| **Campaign control on Snapchat or Google, inside the app** | Changing status and budget from inside the AdFunnl dashboard is Meta and TikTok only. From Claude or ChatGPT (ad control, above) it covers every ad platform. Keep the two apart |
| **New Meta campaigns or ads from Claude or ChatGPT, for everyone** | Creating Meta campaigns, adding new Meta ads and turning existing posts into Meta ads are early access only, until Meta approves the `pages_manage_ads` permission. Show them with an early-access footnote, never a plain tick. Checked 14 October 2026 in `api/app/controllers/api/v1/oauth_controller.rb` |
| **Google status and budgets below campaign level** | On Google, pause, turn on and budgets are campaigns only. Superseded 21 October 2026: Google now also has duplicate, rename, delete, edit (locations, languages, headlines, descriptions, link, bids), new campaigns, keywords and website-visitor audiences, see "Ad control, Google" above |
| **A time it takes to connect** | Nothing measures how long connecting Claude or ChatGPT takes. Do not write "about a minute" |
| **Audience breakdowns on every platform** | Age, gender, device and location come from Meta and Snapchat only. TikTok and Google connectors fetch no breakdown rows. Checked 10 September 2026 |
| **Any customer name, testimonial, or measured result** | We have published none. Not a capability question, a standing rule |
