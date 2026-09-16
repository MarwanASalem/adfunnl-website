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

## Meta Pixel

The pixel lives only in GTM. Neither repo has pixel code, and neither should:
the site and the app both push to the dataLayer and GTM turns that into Meta
events. Checked 2026-09-16: the published container (version 2) held only the
GA4 tag `G-5J8K852WBD`, with no Meta tag, so nothing below is live until it is
added and published.

### Naming

Meta has no `site_section`, so the event name is what separates the two.

- **Site**: custom events, all starting with `Web`, sent with `trackCustom`.
- **App**: Meta standard events (`CompleteRegistration`, `InitiateCheckout`,
  `Purchase`), which is what ad sets optimise for. The site never sends a
  standard event except `PageView`.
- `PageView` fires on both, with `site_section` as a parameter so a custom
  conversion can split them.

| dataLayer event (site) | Meta event | Parameters |
| --- | --- | --- |
| page load, `site_section` = web | `PageView` (standard) | `site_section`, `locale` |
| `web_signup_click` | `WebSignupClick` | `cta_location`, `plan`, `locale` |
| `web_signin_click` | `WebSigninClick` | `cta_location`, `locale` |
| `web_pricing_toggle` | `WebPricingToggle` | `toggle`, `value` |
| `web_engaged_time` with `engaged_seconds` = 60 | `WebEngaged60s` | `page_type`, `locale` |
| `web_scroll_depth` with `percent_scrolled` = 75 | `WebScroll75` | `page_type`, `locale` |

Only those milestones go to Meta, so the ad side gets one clean "engaged
visitor" signal each instead of five near-duplicates. For the app side, the
matching map is `sign_up` to `CompleteRegistration`, `begin_checkout` to
`InitiateCheckout` (with `value`, `currency`) and `purchase` to `Purchase`.

### Tags

Replace `PIXEL_ID` with the dataset ID from Events Manager.

1. **Meta base code**: Custom HTML, trigger "Initialization, All Pages", tag
   firing option "Once per page":

   ```html
   <script>
   !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
   n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
   n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
   t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
   document,'script','https://connect.facebook.net/en_US/fbevents.js');
   fbq('init', 'PIXEL_ID');
   fbq('track', 'PageView', {site_section: {{site_section}}, locale: {{locale}}});
   </script>
   ```

   The app is a single-page app, so it also needs a second tag that sends
   `fbq('track', 'PageView', {site_section: 'app'})` on `virtual_page_view`.
   Do not add that trigger to the site.

2. **Meta web events**: Custom HTML, trigger "Meta web events" (below), tag
   sequencing "fire Meta base code before this tag":

   ```html
   <script>
   (function () {
     var e = {{Event}}, p = {locale: {{locale}}}, name = null;
     if (e === 'web_signup_click') { name = 'WebSignupClick'; p.cta_location = {{cta_location}}; p.plan = {{plan}}; }
     else if (e === 'web_signin_click') { name = 'WebSigninClick'; p.cta_location = {{cta_location}}; }
     else if (e === 'web_pricing_toggle') { name = 'WebPricingToggle'; p.toggle = {{toggle}}; p.value = {{value}}; }
     else if (e === 'web_engaged_time' && {{engaged_seconds}} === 60) { name = 'WebEngaged60s'; p.page_type = {{page_type}}; }
     else if (e === 'web_scroll_depth' && {{percent_scrolled}} === 75) { name = 'WebScroll75'; p.page_type = {{page_type}}; }
     if (name && window.fbq) fbq('trackCustom', name, p);
   })();
   </script>
   ```

   `page_type` is only pushed with `web_page_view`, and GTM keeps the value
   for later events on the same page, so the variable still reads correctly.

3. **Trigger "Meta web events"**: Custom Event, event name matches regex
   `^web_(signup_click|signin_click|pricing_toggle|engaged_time|scroll_depth)$`,
   condition `site_section` equals `web`.

### In Events Manager

- Create custom conversions from `WebSignupClick` (the site's lead signal)
  and, once the app sends it, `CompleteRegistration` (the real signup).
- Add `adfunnl.com` and `app.adfunnl.com` to the dataset's allowed domains.
- Test with the Test Events tab and GTM Preview before publishing.
