# Care32 — Super Speciality Dental Clinic

Marketing website for **Care32 Super Speciality Dental Clinic**, Kukatpally, Hyderabad.

- **Live:** https://www.care32.co.in
- **Host:** Netlify (auto-deploys from the `main` branch)
- **Stack:** Static HTML + CSS + vanilla JS (no build step, no framework)

## Project structure

```
.
├── netlify.toml            # Netlify config (publish dir = website/)
├── README.md
└── website/                # ← published root
    ├── index.html          # Home
    ├── about.html          # About & Doctors
    ├── contact.html        # Contact + appointment form
    ├── privacy-policy.html # DPDP-aware privacy policy
    ├── terms.html          # Terms of use + medical disclaimer
    ├── treatments/         # 9 treatment pages
    │   ├── root-canal-treatment.html
    │   ├── dental-implants.html
    │   ├── braces-and-clear-aligners.html
    │   ├── kids-dentistry.html
    │   ├── smile-makeover.html
    │   ├── dental-crowns-and-bridges.html
    │   ├── dentures.html
    │   ├── gum-disease-treatment.html
    │   └── teeth-whitening.html
    ├── css/styles.css      # Single stylesheet (design system)
    ├── js/main.js          # Nav, smile explorer, FAQ, form, consent/GA
    ├── assets/img/         # Optimised images
    ├── _redirects          # 301s from old Wix URLs
    ├── sitemap.xml
    └── robots.txt
```

## Local development

No build step. Serve the `website/` folder with any static server:

```bash
cd website
python3 -m http.server 4173
# open http://localhost:4173
```

## Deploying

Push to `main` → Netlify builds and deploys automatically (publish directory `website/`, set in `netlify.toml`). The custom domain `care32.co.in` points to Netlify; old Wix URLs 301-redirect via `website/_redirects`.

**Cache-busting:** CSS/JS are linked with a `?v=NN` query (e.g. `styles.css?v=37`). When you edit `css/styles.css` or `js/main.js`, bump that number across the HTML files so browsers fetch the new file.

## Features

- Responsive, accessible design system (one stylesheet); flat "liquid-glass" UI, blue accent.
- SEO: per-page titles/meta/canonical/OG, plus `Dentist` / `MedicalWebPage` / `MedicalProcedure` / `FAQPage` / `Person` / `BreadcrumbList` JSON-LD, sitemap and robots.
- Treatments mega-dropdown nav on every page.
- Interactive "Where does it hurt?" smile explorer — each tooth links to its treatment.
- Contact/appointment form → **Netlify Forms** (emails the clinic) + WhatsApp fallback.
- **Setmore** online booking widget + buttons; click-to-call and WhatsApp throughout.
- Cookie-consent banner gating **Google Analytics 4** (consent-first).

## Analytics

- **Google Analytics 4** (`G-J74BWV9274`) and **Google Tag Manager** (`GTM-PZJP28C`) are installed in the `<head>` of every page, with the GTM `<noscript>` after `<body>`.
- Loaded via **Google Consent Mode v2**: `analytics_storage` defaults to `denied` and is set to `granted` only when the visitor accepts the cookie banner (the Decline button is therefore real).
- Note: GA4 is fired both directly (gtag) and is available to GTM. If you also add a GA4 tag for `G-J74BWV9274` inside the GTM container, configure it in only one place to avoid double-counting.

## Configuration still required

One-time setup outside the code:

- **Netlify Forms notification** — in Netlify → Forms → `contact` → add an email notification to `support@care32.co.in`.
- **Setmore** — booking URL is `https://care32.setmore.com/`.

## Content notes / to-do

- Doctor credentials (`MDS`, `20+ yrs`) are **placeholders** — update with real degrees/registration once available.
- Imagery is licensed stock (optimised) standing in until real clinic/team/patient photos are supplied.
- Pending: before/after sliders (real or generated teeth images), sub-page photos, confirmed opening hours and any prices.
