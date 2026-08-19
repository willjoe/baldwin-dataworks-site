# Baldwin Data Works — site

Static site for `www.baldwin-dataworks.com`, served via GitHub Pages from
this repo's `main` branch. Plain HTML/CSS/JS on purpose — no build step.

- `index.html` / `index.css` / `index.js` — main consulting site (bio,
  track record, services, R&D project cards, business card)
- `fmify/` — FMify app site: overview, privacy policy, support, and a
  feedback form that files bugs/feature requests as GitHub issues
- `telegratalk/` — TelegraTalk app site: overview, privacy policy,
  support, age rating, and a feedback form
- `simpletrumpcard/` — Simple Trump Card feedback form (the app itself is
  only listed as a project card on the main site, no dedicated overview
  page yet)
- `insights/` — standalone BI tool suite demos (customer management,
  geo-analytics, product assortment, project management, operations
  visualization)
- `images/` — shared image assets
- `CNAME` — the custom domain GitHub Pages serves this repo on

## Feedback forms

Each app's `feedback.html` posts to the shared
[`feedback-worker`](https://github.com/willjoe/feedback-worker) Cloudflare
Worker, which routes the submission to that app's GitHub repo based on
the URL path and files it as an issue.

## Local preview

Any static file server works, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000`.

## Deploying

Push to `main` — GitHub Pages redeploys automatically. No CI step needed.
