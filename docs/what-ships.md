# What AdFunnl actually does

**Last checked against the app: 18 August 2026. Ad control checked 14 October 2026, Google and audiences rechecked 21 October 2026. Reports, creative pages, referrals and support channels checked 29 October 2026. Ad control, trials and the Change Log rechecked 11 November 2026. Campaign copying, brand notes, MCP updates and assistant setup added 25 November 2026.**

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
| Creative analysis | Best Creatives, with the creative itself in the page. Ranked by a composite score, not one metric: ecommerce mode weights ROAS 40%, cost per purchase 40% and outbound CTR 20%, each standardised across the ads currently in view. Messaging mode is Meta only and weights cost per message 80%, CTR 20%. Ad level is **Meta, TikTok and Snapchat**, several accounts at once (TikTok added since: `supports_ad_level?` is true in `api/lib/connectors/tiktok.rb`, checked 29 October 2026). Google has no ad-level creative data. Checked 19 August 2026 in `web/src/lib/creative-score.ts` and `web/src/pages/BestCreativesPage.tsx` |
| Creatives overview and Spend timeline | Under Creatives next to Best Creatives, Hook & Hold and Ad Fatigue. Spend timeline shows daily spend per ad and each ad's share of the budget, so you see spend moving between ads, with budget shifts listed. Solo and up. One-click PDF. Checked 29 October 2026 in `web/src/pages/SpendTimelinePage.tsx` |
| Reports (ready-made) | A Reports section, open to every workspace since 27 October 2026 (`saved_reports` flag enabled globally). **Ads manager**: every campaign across the brand's ad platforms in one table, drilling campaign, ad set, ad, with the on and off switch and budget editor where campaign control exists, ad thumbnails, column picker and reorder, conditional formatting. **Ads timeline**: the brand's main figures day by day, blended and per platform, with the change log marked on every chart. **Audience insights**: spend by region on a map, then pies by gender, age, device OS, platform and placement (so Meta and Snapchat only, as with breakdowns). Saved views keep dates, filters, accounts and formatting. Checked 29 October 2026 in `web/src/pages/AdsManagerReportPage.tsx`, `AdsTimelineReportPage.tsx`, `AudienceInsightsReportPage.tsx` |
| Charts drill-down in Reports | In the Ads manager report, hovering a campaign, ad set or ad row shows a Charts action: a popup charting that item's metrics over time (log scale, data labels on by default, its own date range), with an Audience tab of gender, age and placement pies for that item (Meta and Snapchat, as with breakdowns). App commits 99c8fb94, 5f70df9e, 9030c086, 516b6fb7, c5747c19 (24 November 2026), no flag. Checked 25 November 2026 |
| Dashboards linked to templates | A dashboard made from a template remembers it. When the template is overwritten, the workspace's linked dashboards are offered the update, with undo, and can be restored. Deleting a template first says how many dashboards use it. App commits bac25855, f7cd5440, d9b936aa, 747f468b (24 November 2026), no flag. Checked 25 November 2026 |
| Fund reminders | The Billing insights page (nav label "Fund Reminders"): every ad account's balance, stopped and at-risk accounts first. **Meta only**: `supports_billing?` is true only in `api/lib/connectors/meta.rb`. Checked 29 October 2026 |
| Assistant language | Ada answers in the user's app language, so an Arabic user gets Arabic replies. Checked 29 October 2026 in `api/app/services/chat_assistant.rb` (`language_directive`) |
| Dashboards on phones | Dashboards open and can be edited on a phone, scaled to fit. App commit 26 October 2026 (`feat(dashboards): allow edit mode on phones`) |
| Account review (Ada and MCP) | Reviews every ad set and ad of a brand, this month against the last 4 days, peers and last month, and gives each a verdict. Shipped 28 October 2026 (app commits `feat(ada,mcp): account review`), not re-read in code |
| Creative filters | Minimum spend threshold, defaulting to the average spend across the ads in view, so low-spend noise drops out of the ranking. Plus filters on platform, campaign and objective, a date range, list or grid view, and a one-click PDF of the page. Checked 19 August 2026 |
| Audience breakdowns | Breakdown widgets (donut, bar, table, geo map) by age, gender, device, country, region, placement and day of week, summed across every account and campaign in view. **Meta and Snapchat only.** Meta has all of them; Snapchat has gender, age, country and region, no device. TikTok and Google bring in no breakdowns. Checked 10 September 2026 in `web/src/lib/builder-types.ts` (`BREAKDOWN_DIMENSIONS`), `api/lib/connectors/meta.rb` and `api/lib/connectors/snapchat.rb` |
| Ad fatigue | Tracked across every ad platform. Confirmed 19 August 2026: Meta, TikTok, Snapchat and Google |
| Hook and hold | Video retention, where viewers drop off. **Meta only.** Checked 19 August 2026 in `web/src/pages/HookHoldRatesPage.tsx` |
| ~~Pulse~~ | **Deprecated 29 October 2026.** See Do not claim |
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
| ~~Looker Studio~~ | **Deprecated 29 October 2026.** See Do not claim |
| Digest view | An in-app read-only page mirroring a dashboard one to one |
| Ads play in live shares | Video ads play inside a live shared report. App commit 26 October 2026 (`feat(shares): play ads inside live shared reports`) |
| Referrals | "Give a month, get a month": you and a friend each get a free month when the friend connects their ads, up to 2 free months earned (`Referral::MAX_REWARDS`). Checked 29 October 2026 in `web/src/pages/ReferralsPage.tsx` and `api/app/models/referral.rb` |
| Affiliate program | Open to any workspace from 26 November 2026; staff approve every application, applied for by an owner or admin, the whole workspace joins. 10% of what each new customer pays in the app (card or wallet, through Paymob) for 12 months from their first payment, available 30 days after each payment, paid monthly by bank transfer or InstaPay in EGP once the available balance reaches EGP 500. Only brand-new accounts made through the affiliate link count; the affiliate's own team and workspaces they work in do not; refunds come off commission; no discount for the customer. Join link `app.adfunnl.com/affiliate/join`. Checked 26 November 2026 in the app at `api/app/models/affiliate.rb` (`DEFAULT_RATE_BPS`, `HOLD_DAYS`, `MIN_PAYOUT_CENTS`), `api/app/services/affiliates/ledger.rb`, and app commits 82aa66ec and 49b34d34 |
| Support channels | The app's Help button: a support form answered by email, support@adfunnl.com, and WhatsApp at +20 115 708 6780 (`web/src/lib/whatsapp.ts`), read and answered by a person. Checked 29 October 2026 |

## Ask

| Capability | Notes |
|---|---|
| In-app assistant | On every page, natural language, streamed answers that show the data used, per-workspace memory |
| MCP server | Claude, ChatGPT or any MCP client can query the same unified data |
| AI credits | Assistant usage runs on a per-workspace credit balance. From 1 November 2026 every paid plan includes the assistant and MCP access: 300 credits a month on Solo, 1,000 on Growth, 2,000 on Agency; extra credits are one-off packs (500 for EGP 690 / $12, 5,000 for EGP 7,790 / $129). There is no AI add-on any more. Checked 31 October 2026 in `api/app/models/plan_config.rb` |
| Ad control (changing ads from Claude or ChatGPT) | Over MCP. Every change is two-phase (small exact changes the user named are the exception, see below): the first call changes nothing and returns a plan, and only a second call after the user approves it applies it. An applied change lands in the brand's Change Log. Included on every paid plan (Solo, Growth, Agency and Enterprise) from 6 November 2026, never on a trial, never on Free. The Solo ad control add-on (EGP 590 / $10) was retired the same day and is no longer sold. Behaviour checked 14 October 2026 in `api/app/services/analytics/ad_management.rb`; plans checked 6 November 2026 in `api/app/models/workspace.rb` (`ad_control?`) and `api/app/models/plan_config.rb` (`ad_control` per plan, app commit 870ec731) |
| Extra seat add-on | EGP 490 / $8 per seat per month (EGP 400 before 1 November 2026), on Solo (1 seat included) and Growth (3 included). Agency includes 10 seats, beyond that is Enterprise. Requested and approved by the AdFunnl team, not instant checkout. Existing customers granted seats at EGP 300 keep that price (do not mention on the site). Shipped in the app 21 October 2026, figures taken from the app team's brief, not re-read in the app repo |
| Paying for a plan | Card checkout through Paymob for every workspace: pick a plan on the Plans page, pay, and the plan turns on when the payment goes through. A card saved at checkout renews the plan automatically (auto-renew can be turned off). Plan requests and manual approval were retired 25 November 2026 (app commits 7883b9b9 and 58dd7135, `paymob_checkout` flag removed as on for everyone). Checkout charges in **EGP** (`Payment.checkout_terms_for` uses `cycle_price_egp`). Extra seats and AI credit top-ups are **still requested** and added by the team, not paid at checkout (`PlansPage.tsx` SoloAddons, `credit_topups_controller.rb`). Checked 25 November 2026 |
| Ad control, platform status | **No Live or Beta labels on the site** (owner, 25 November 2026), replacing the 14 October labels (TikTok and Snapchat Live, Meta and Google Beta). The ad control table on `/ai-ad-control` shows Google as plain ticks by the owner's call; keep the Google limits (budgets and status on campaigns, new ad sets in Search only, website-visitor audiences) in prose elsewhere |
| Ad control, every platform | Pause and turn on, and change budgets, on Meta, TikTok, Snapchat and Google. **Google is campaigns only** for both. A budget rise over 50% is held back unless asked for explicitly. Checked 14 October 2026 (`set_ad_status`, `set_ad_budget`, `set_ad_budgets`) |
| Ad control, Meta, TikTok and Snapchat | Duplicate (the copy is always created paused), rename, delete, edit the audience, edit ad text, and set URL tracking tags. Checked 14 October 2026 (`duplicate_ad_item`, `update_ad_item`, `set_ad_url_tags`, `delete_ad_item`, `ITEM_PLATFORMS`) |
| Ad control, new campaigns and ads | Meta opened to everyone 25 October 2026, see "Ad control, more actions". TikTok and Snapchat: new campaigns from videos and images on Google Drive, new ad groups or ad sets and new ads added to running campaigns, everything created switched off. TikTok can also run posts already on the profile as ads. Meta: the same tools exist (new campaigns, new ads in an existing ad set, existing Facebook and Instagram posts as ads) but are **early access only**, see "Do not claim". Checked 14 October 2026 in `ad_management/tiktok_creation.rb`, `ad_management/snapchat_creation.rb`, `ad_management/creation.rb` |
| Ad control, Snapchat extras | Catalog ads (with catalog templates) and call ads. Checked 14 October 2026 in `ad_management/snapchat_catalogs.rb` and `snapchat_creation.rb` |
| Ad control, Meta extras | Automated rules, budget schedules, custom and lookalike audiences, custom conversions. Checked 14 October 2026 in `ad_management/automation.rb`, `ad_management/audiences.rb` and `ad_management/account_tools.rb` |
| Ad control, Google | Checked 21 October 2026 in `ad_management/google_creation.rb` and `ad_management/audiences.rb`. New campaigns (all created paused): Search, Shopping, Display, Demand Gen and Performance Max, from the user's own text and Drive images; videos must already be on YouTube. Add ad groups and ads to Search campaigns. Copy Search and Performance Max campaigns. Edit campaign locations, languages, target CPA or ROAS, ad group bids, responsive search ad headlines, descriptions and link. Keywords, negative keywords and search terms. Sitelinks and callouts. Conversion goals. Website-visitor audiences only (no customer lists or lookalikes on Google). Budgets and status stay campaign level |
| Ad control, audiences | Create audiences from Claude or ChatGPT: Meta (custom, lookalike), TikTok (website, ad engagement, lead form, lookalike), Snapchat (website visitors by Snap Pixel, customer lists, lookalikes), Google (website visitors only). Checked 21 October 2026 in `ad_management/audiences.rb`, `tiktok_audiences.rb`, `snapchat_audiences.rb`. Automated rules and budget schedules remain Meta only |
| Ad control, inside the app | AdFunnl's own assistant has every ad control tool too (pause, budgets, duplicate, edit, delete, new campaigns and ads, audiences, rules), so the reader needs no Claude or ChatGPT setup. Every change there is a plan first with a Go ahead button; a delete shows a red Delete button and a "can't be undone" line. Same plan gating as the MCP. App commits efbf8dff (26 October), 6c6f5d7c and aa398b94 (26 October 2026). The site does not name the assistant: write "the assistant inside AdFunnl" |
| Ad control, free trials | **Trials include ad control** since 8 November 2026 (app commits ce8f51b5 and ac6dbd49; `Workspace#ad_control?` reads `effective_plan`). Free still has none. Checked 11 November 2026 |
| Ad control, small exact changes | Writers only, not for the page: when the user's own message names an exact change (on or off, or a budget), a small one is applied straight away without a second yes; anything larger, or any Google budget, still returns a plan. App commit c9551232 (19 October 2026), checked 11 November 2026 in `ad_management.rb` (`DIRECT_MAX`). Inside the app every change is still a plan first. Keep "approve every change" wording true to this: the AI acts only on what the user asked for |
| Ad control, more actions (Oct to Nov 2026) | Add new ad sets to running Meta campaigns (and ad groups, ad sets on TikTok, Snapchat; Google Search only). Catalog campaigns on Meta, TikTok and Snapchat. Create lead forms on Meta and Snapchat. Read, reply to and hide comments on ads, Meta and TikTok. Meta A/B tests. Customer-list audiences on Meta and TikTok. App install campaigns on TikTok and Snapchat. Use a video or image attached in the chat as ad media. Checked 11 November 2026 in the tool list of `api/app/services/analytics` |
| Change Log | Every brand gets one automatically on its first change (since 8 November 2026, app commit 3230321e). It records changes made in AdFunnl, by the in-app assistant and from Claude or ChatGPT, with who and when, and copies in edits made directly in **Meta** Ads Manager (Meta only, `PlatformActivityImportJob`). The team can add notes by hand. It is kept as one of the brand's data sources and marked on the Ads timeline charts. **The AI reads it**: account reviews, period comparisons and campaign lists carry the brand's recent Change Log lines next to the numbers, for the in-app assistant and for Claude or ChatGPT (app commit 9c628f9d, 10 November 2026, `api/app/services/analytics/recent_changes.rb`). Do not put the lookback window or the import interval on the site |
| Ad control, read-only option | The approval screen has a box, "Also allow it to make changes". Untick it and the assistant connects read-only. Checked 14 October 2026 in `api/app/views/doorkeeper/authorizations/new.html.erb` |
| Ad control, copy a campaign to other platforms | `clone_campaign`: a campaign created through AdFunnl on Meta, TikTok or Snapchat is copied to the brand's other platforms among those three, as one combined plan approved with one yes, everything created paused. Not Google. Only campaigns created through AdFunnl since 23 November 2026 (the create tool's arguments are kept on its log). From Claude, ChatGPT and the in-app assistant. App commits c73c9f60, 8911c2af (23 November 2026), checked 25 November 2026 in `ad_management/campaign_cloning.rb` |
| Brand notes | Each brand (a client in the app) keeps notes: its goal, industry, markets, targets per metric, and facts such as a test and its result. Written by the team in the app or by the AI (`remember_client_fact`, `set_brand_target`, `set_brand_profile`), and read by the in-app assistant and by Claude or ChatGPT over MCP (`get_brand_notes`). App commits aa398b94 (26 October 2026) and 8a63cfcb (10 November 2026). Checked 25 November 2026 in `api/app/services/analytics/tool_registry.rb` and `api/app/models/client_memory.rb` |
| MCP updates | Every MCP call is logged with its failure details and the team reviews them from an admin page (`mcp_calls`, `api/app/controllers/api/v1/admin/mcp_calls_controller.rb`). The MCP tools have had commits every week since September 2026. Safe wording: "we read where it gets stuck and ship fixes every week". **Never** "trained on", "learns from your data" or a count of users: no model is trained. Checked 25 November 2026 |
| Connecting each assistant | From the app's Connect AI tools dialog (`web/src/components/chat/ConnectAiToolsDialog.tsx`, strings `connectAi.*`), checked 25 November 2026. **Claude**: Settings, then Connectors, Add custom connector, paste the server address, Connect, sign in with AdFunnl and approve, then turn AdFunnl on from the tools menu. **Claude Code**: `claude mcp add --transport http adfunnl <address>`, then `/mcp` and Authenticate. **ChatGPT**: Settings, then Plugins, Add custom MCP server (the ChatGPT plan or admin must allow it), name it AdFunnl, paste the address, OAuth, Create, sign in and approve. **Any other**: a remote MCP server over streamable HTTP, no API key, sign in through the browser. The address is `https://api.adfunnl.com/mcp` (top-level `post "mcp"` in `api/config/routes.rb`, host `api.adfunnl.com` in `.railway/railway.ts`; its OAuth metadata answered 200 on 25 November 2026). The owner decided on 25 November 2026 to print it on the site. **Signing up from the connect step works since 25 November 2026** (app commit 145c1d24): the sign-in page the assistant opens has "Create an account", signup keeps the request and returns the person to finish connecting right after the plan step. Safe wording: paste the address, create your free AdFunnl account right from there, then connect your ad accounts in AdFunnl. **Do not promise**: answers right away (no data until ad accounts are connected in AdFunnl), a trial that starts by itself (one click on the plan step, and a trial can be refused), or no verification (email code, two-step setup, phone check when on). ChatGPT only on plans that allow custom connectors. The approval screen is English only |

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
| **Pushing data out to warehouses or Sheets** | No push adapters exist. The tables were designed for it and the code was never written. Data out is pull-only: share links and PDF. Google Sheets is import only |
| **Campaign control on Snapchat or Google, inside the app** | Changing status and budget from inside the AdFunnl dashboard is Meta and TikTok only. From Claude or ChatGPT (ad control, above) it covers every ad platform. Keep the two apart |
| ~~New Meta campaigns or ads from Claude or ChatGPT, for everyone~~ | **Superseded 25 October 2026**: Meta approved `pages_manage_ads` and creation is open to every workspace with ad control (app commit b9f0c780). Old note: creating Meta campaigns, adding new Meta ads and turning existing posts into Meta ads are early access only, until Meta approves the `pages_manage_ads` permission. Show them with an early-access footnote, never a plain tick. Checked 14 October 2026 in `api/app/controllers/api/v1/oauth_controller.rb` |
| **Ad control as a paid add-on, or Solo without ad control** | Retired 6 November 2026. Every paid plan includes ad control, and the only add-on is extra seats |
| **Google status and budgets below campaign level** | On Google, pause, turn on and budgets are campaigns only. Superseded 21 October 2026: Google now also has duplicate, rename, delete, edit (locations, languages, headlines, descriptions, link, bids), new campaigns, keywords and website-visitor audiences, see "Ad control, Google" above |
| **A time it takes to connect** | Nothing measures how long connecting Claude or ChatGPT takes. Do not write "about a minute" |
| **Audience breakdowns on every platform** | Age, gender, device and location come from Meta and Snapchat only. TikTok and Google connectors fetch no breakdown rows. Checked 10 September 2026 |
| **Pulse** | Deprecated (owner, 29 October 2026). No Scale, Hold or Cut verdicts anywhere on the site, and no rules-based account watching |
| **Looker Studio** | The Looker Studio connector is deprecated (owner, 29 October 2026). Data out is share links and PDF only |
| **Internals a competitor could copy** | Owner's rule, 29 October 2026: say what a feature does for the reader, never how it works inside. No Best Creatives score weights, no thresholds (the 50% budget hold, the minimum spend default), no account review comparison windows. The facts stay in this file for writers; they do not go on pages |
| **Attribution (pixel, UTM setup, multi-touch models, customer journeys, new against returning customers)** | Built in the app in November 2026 (commits 4e73097b, c34d533e, e5a8c7d9) but still **behind a feature flag** (owner, 25 November 2026). Leave it off the site until the owner says it is open to everyone |
| **Competitor Radar** | A staff preview behind the `competitor_radar` flag (`web/src/lib/flags.ts`), not open to customers. The owner says it is not done (29 October 2026). Leave it off the site entirely, not even as coming soon |
| **Any customer name, testimonial, or measured result** | We have published none. Not a capability question, a standing rule |
