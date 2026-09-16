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
| `web_pricing_toggle` | Billing or currency switch on the pricing page | `toggle` (billing or currency), `value` |
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

## GTM setup

1. **Variables** (Data Layer Variable): `site_section`, `locale`, `cta_text`,
   `cta_location`, `link_url`, `plan`, `page_type`, `percent_scrolled`,
   `engaged_seconds`, `toggle`, `value`, `from_locale`, `to_locale`,
   `link_domain`, `max_scroll_percent`.
2. **Trigger** "Web events": Custom Event, event name matches regex `^web_`,
   with condition `site_section` equals `web`.
3. **Tag** GA4 Event: event name `{{Event}}`, trigger "Web events", pass the
   variables above as event parameters. Register them as custom dimensions
   in GA4 (`engaged_seconds` and `percent_scrolled` as metrics if wanted).
4. **Page views**: the GA4 Google tag on the site should keep its automatic
   `page_view` and fire on "Initialization, All Pages" with the condition
   `site_section` equals `web`. The app turns automatic page views off and
   uses `virtual_page_view`, so check that the app's Google tag trigger is
   limited to `site_section` equals `app`.
5. **Cross-domain**: in GA4 Admin, Data streams, Configure tag settings,
   Configure your domains, add `adfunnl.com` and `app.adfunnl.com`. Without
   it a signup starts a new session on the app and loses the website source.
6. **Conversions**: mark `web_signup_click` as a key event for the site, and
   keep the app's `sign_up` as the real signup.

Session duration and engaged time are also calculated by GA4 on its own from
these hits. `web_engaged_time` and `web_page_exit` give the same data per page.
