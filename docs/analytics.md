# Analytics

The site and the app share one Google Tag Manager container, `GTM-WL3FT97F`.
Two things keep their data apart:

- `site_section` is `"web"` on every site push and `"app"` on every app push.
  The site sets it before GTM loads (`src/layouts/Layout.astro`), so even
  GTM's built-in events carry it.
- Every site event name starts with `web_`. The app's names never do.

The code is `src/scripts/analytics.ts`. It is loaded once by the layout and
works through event delegation, so a new page or a new `Start free` link is
tracked with no extra code.

## Site events

Every event also carries `site_section` and `locale` (`en` or `ar`).

| Event | When | Parameters |
| --- | --- | --- |
| `web_page_view` | Every page load | `page_path`, `page_title`, `page_type` (home, persona, features, pricing, legal, about) |
| `web_signup_click` | Click on any link to `app.adfunnl.com/signup` (every `Start free`) | `cta_text`, `cta_location`, `link_url`, `plan` (solo, growth, agency or none) |
| `web_signin_click` | Click on `Sign in` | `cta_text`, `cta_location`, `link_url` |
| `web_app_link_click` | Click on any other app link | `cta_text`, `cta_location`, `link_url` |
| `web_outbound_click` | Click on a link to another site | `cta_text`, `cta_location`, `link_url`, `link_domain` |
| `web_language_switch` | Click on the EN / ع switch | `from_locale`, `to_locale` |
| `web_pricing_toggle` | Billing or currency switch on the pricing page | `toggle` (billing or currency), `value` (sent on as `toggle_value`) |
| `web_scroll_depth` | Page scrolled past 25, 50, 75, 90% | `percent_scrolled` |
| `web_engaged_time` | 15, 30, 60, 120, 300 seconds with the tab visible | `engaged_seconds` |
| `web_page_exit` | Leaving the page (best effort) | `engaged_seconds`, `max_scroll_percent` |

`cta_location` is `nav`, `footer`, the section's `id`, `hero` for the first
section, or `section_N`. To give a block a clearer name, put
`data-track-location="name"` on it.

## App events (do not reuse these names)

Pushed by the app repo, `web/src/lib/analytics.ts`, checked 2026-09-16:
`sign_up`, `login`, `create_report`, `share_report`, `connect_ad_account`,
`begin_checkout`, `purchase`, `virtual_page_view`.

The site cannot see a finished signup. The app reports that as `sign_up`. The
site reports the click that led to it (`web_signup_click`).

## GTM setup (done 2026-09-16, workspace 5)

Container `adfunnl.com`: account 6377185275, container 264309892. Changes are
made through the `gtm` MCP connector. Publishing goes live on the site and the
app together.

- **Variables**: one Data Layer Variable per parameter, named `DLV - <key>`,
  plus `DLV - event` for the event name.
- **Trigger `CE - web events (GA4)`**: every site event except
  `web_page_view`, only when `site_section` is `web`. The Google tag already
  sends the site's `page_view` (the `LT - send_page_view` lookup turns it off
  only for the app), so `web_page_view` would count page views twice.
- **Tag `GA4 Event - web events (site)`**: the GA4 event name is the dataLayer
  event name, with every parameter above. The pricing switch's `value` goes
  out as `toggle_value`, because GA4 and Meta both read `value` as money.
- **Page views**: the `Google Tag - GA4` tag, shared with the app.

Still to do in GA4 itself:

1. Register the parameters as custom dimensions (`engaged_seconds`,
   `percent_scrolled` and `max_scroll_percent` as metrics).
2. **Cross-domain**: Admin, Data streams, Configure tag settings, Configure
   your domains: add `adfunnl.com` and `app.adfunnl.com`. Without it a signup
   starts a new session on the app and loses the website source.
3. Mark `web_signup_click` as a key event for the site, and keep the app's
   `sign_up` as the real signup.

GTM keeps every dataLayer key until it is overwritten, so `push()` in
`src/scripts/analytics.ts` clears the event-level keys on every event. A new
parameter must be added to `EVENT_KEYS` there, or it leaks onto later events.

Session duration and engaged time are also calculated by GA4 on its own from
these hits. `web_engaged_time` and `web_page_exit` give the same data per page.

## Meta Pixel

Pixel `3321955894662588` (GTM variable `Meta Pixel ID`). It lives only in GTM:
neither repo has pixel code. Every Meta tag carries the same loader, which
initialises the pixel once per page with automatic event collection off, and
the app's two blocking triggers for pages whose URL carries a secret.

### Naming

Meta has no `site_section`, so the event name is what separates the two.

- **Site**: custom events, all starting with `Web`.
- **App**: `CompleteRegistration`, `InitiateCheckout` and `Purchase`
  (standard, what ad sets optimise for), plus custom `ConnectAdAccount` and
  `SPAPageView`.
- `PageView` fires on both, once per page load. Split website from app by
  domain (`www.adfunnl.com` or `app.adfunnl.com`).

| dataLayer event (site) | Meta event | Parameters |
| --- | --- | --- |
| page load | `PageView` (tag `Meta Pixel - PageView`) | none |
| `web_signup_click` | `WebSignupClick` | `cta_location`, `plan`, `locale` |
| `web_signin_click` | `WebSigninClick` | `cta_location`, `locale` |
| `web_pricing_toggle` | `WebPricingToggle` | `toggle`, `toggle_value`, `locale` |
| `web_engaged_time` at 60 seconds | `WebEngaged60s` | `page_type`, `locale` |
| `web_scroll_depth` at 75% | `WebScroll75` | `page_type`, `locale` |

Tag `Meta Pixel - Web events (site, custom)`, trigger
`CE - web events (Meta)`. Only the 60 second and 75% milestones go to Meta, so
the ad side gets one clean engaged-visitor signal each instead of
near-duplicates.

### In Events Manager

- Create custom conversions from `WebSignupClick` (the site's lead signal) and
  `CompleteRegistration` (the real signup).
- Add `adfunnl.com` and `app.adfunnl.com` to the dataset's allowed domains.
