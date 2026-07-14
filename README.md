# Aquaservice Hamlock – Landingpage

Minimalistischer Onepager: Vermittlung von Schwimmbadpersonal (Rettungsschwimmer, Badpersonal) für Bäderbetriebe im Umkreis von 100 km um Fürstenfeldbruck.

## Struktur

```
index.html              Onepager (kompletter Inhalt)
css/tokens.css          Design-Tokens – einzige Stelle für Farben/Typo/Spacing
css/styles.css          Layout & Komponenten (nutzt nur Tokens)
api/contact.js          Vercel Function: Turnstile-Prüfung + Mailversand (Resend)
assets/                 Bilder (Gründer-Foto etc.)
docs/landingpage-inhalte.md   Inhaltskonzept & Recherche-Notizen
```

## Workflow

1. Inhalte anpassen → `index.html` / `docs/landingpage-inhalte.md`
2. Design anpassen → zuerst `css/tokens.css`, dann `css/styles.css`
3. Deploy → Repo mit Vercel verbinden (statisches Projekt, kein Build nötig)

## Kontaktformular (Bot-Schutz)

Cloudflare Turnstile + Vercel Function + Resend. Setup nach dem Vercel-Connect:

1. Cloudflare-Dashboard → Turnstile → Widget für die Domain anlegen
2. Sitekey in `index.html` einsetzen (`TURNSTILE_SITEKEY_HIER`)
3. In Vercel drei Env-Variablen setzen: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_EMAIL`

## Bilder

Erwartete Dateien in `assets/` (Namen exakt so):

- `hero-pool.jpg` – Schwimmhalle (Hero, rechts)
- `schwimmer.jpg` – Schwimmer im Becken (Bild-Band, links)
- `schwimmbahn.jpg` – Sonniges Becken mit Bahnen (Bild-Band, rechts)
- `wasser-textur.jpg` – Wasseroberfläche (Hintergrund Über-Sektion)

Vor dem Push idealerweise auf ~1600 px Breite verkleinern und komprimieren.

## Offene Punkte

- [ ] Telefonnummer + E-Mail einsetzen (Platzhalter `0000 000 0000` / `kontakt@example.de`)
- [ ] Gründer-Foto in `assets/` + in Über-Sektion einbinden
- [ ] Turnstile-Sitekey + Vercel-Env-Variablen (siehe oben)
- [ ] Impressum & Datenschutz-Seiten
- [ ] Firmenname final klären (Arbeitstitel: Aquaservice Hamlock)
