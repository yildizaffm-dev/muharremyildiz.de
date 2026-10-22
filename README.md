# muharremyildiz.de

Statische Seite, ausgeliefert über Cloudflare Pages (Projekt `muharremyildiz-de`, Branch `gh-pages`, kein Build, Ausgabeordner `/`). DNS liegt bei Cloudflare; E-Mail weiterhin bei netcup (MX, Wildcard und autoconfig auf „DNS only“).

- `/` – Landingpage
- `/impressum/` – Impressum (§ 18 Abs. 1 MStV, Büroanschrift)
- `/datenschutz/` – Datenschutzerklärung (Hosting Cloudflare)
- `/diamant/`, `/diamond/`, `/pirlanta/`, `/almas/`, `/darija/` – Der Diamant im Sumpf · Die Essenz in fünf Sprachen (unverlinkt, noindex)

Alle Seiten tragen `noindex`, zusätzlich als HTTP-Header über `_headers`; die robots.txt erlaubt das Crawlen, damit Suchmaschinen das noindex lesen können.

© 2026 Muharrem Yıldız. Alle Rechte vorbehalten. Kein Open Source: Texte, Bilder und Gestaltung dürfen ohne schriftliche Zustimmung nicht übernommen werden.

## Arbeitsweise: erst prüfen, dann live

1. Änderungen kommen zuerst auf den Zweig `vorschau`.
2. Cloudflare baut daraus automatisch eine Vorschau: https://vorschau.muharremyildiz-de.pages.dev (noindex, nicht öffentlich verlinkt).
3. Nach Freigabe wird `vorschau` in `gh-pages` übernommen – Cloudflare stellt das in etwa einer Minute live auf https://muharremyildiz.de.

Rückweg: jeder frühere Stand lässt sich in GitHub wiederherstellen oder in Cloudflare unter „Einsätze“ mit einem Klick zurückrollen.
