#!/usr/bin/env python3
"""Erzeugt Ratgeber-, Branchen- und Rechtsseiten, den Footer der Startseite und die sitemap.xml.

Inhalte liegen in inhalte/ratgeber/*.html und inhalte/branchen/*.html.
Jede Datei beginnt mit <!--META {...}--> (JSON) und enthält danach den HTML-Body.

Aufruf aus dem Repo-Stamm:  python3 tools/seiten_bauen.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'https://www.kontaktstoff.com'
STAND = '2026-09-26'
STAND_TEXT = '26. September 2026'

RATGEBER = [  # Reihenfolge = Reihenfolge in Übersicht und Footer
    ('b2b-mailing', 'B2B-Mailing: Leitfaden'),
    ('kaltakquise-methoden', 'Akquise-Methoden im Vergleich'),
    ('wirkung-von-post', 'Wie Post im Unternehmen wirkt'),
    ('telefonakquise-b2b', 'Telefonakquise im B2B'),
    ('cold-email-b2b', 'Cold E-Mail im B2B'),
    ('werbung-per-post-recht', 'Werbung per Post: Rechtslage'),
    ('roi-postkampagne', 'ROI einer Postkampagne'),
]
BRANCHEN = ['agenturen', 'it-dienstleister', 'recruiting', 'industrie', 'gewerbeenergie']
RECHTLICHES = [('impressum', 'Impressum'), ('datenschutz', 'Datenschutz'), ('agb', 'AGB'),
               ('widerruf', 'Widerruf'), ('kontakt', 'Kontakt')]

e = html.escape

# Titelbilder: assets/artikel/<slug>.webp (1600 px), <slug>-640.webp (Karten), <slug>-og.jpg (1200 × 630)
BILD_ALT = {
    'b2b-mailing': 'Hände öffnen einen persönlich adressierten Umschlag mit einer Karte auf einem Schreibtisch',
    'kaltakquise-methoden': 'Schreibtisch mit Laptop, Smartphone, Headset und einer auffälligen gedruckten Postkarte',
    'wirkung-von-post': 'Gedruckte Postkarte lehnt am Bildschirm auf dem Schreibtisch einer Geschäftsführerin',
    'telefonakquise-b2b': 'Vertriebsmitarbeiter mit Headset macht sich während eines Telefonats Notizen',
    'cold-email-b2b': 'Laptop mit vollem E-Mail-Posteingang neben einem einzelnen gedruckten Brief',
    'werbung-per-post-recht': 'Stapel adressierter Geschäftsbriefe mit Brille, Füller und einer Checkliste',
    'roi-postkampagne': 'Taschenrechner, gedrucktes Balkendiagramm und Postkarten bei der Kampagnenplanung',
    'agenturen': 'Designerin in einer Agentur hält eine personalisierte Postkarte in der Hand',
    'it-dienstleister': 'Manager eines IT-Dienstleisters liest einen Selfmailer, im Hintergrund ein Serverraum',
    'recruiting': 'Personalverantwortliche hält in einem Besprechungsraum eine gedruckte Klappkarte',
    'industrie': 'Ingenieur in einer Produktionshalle hält ein Pop-up-Mailing, dahinter ein Roboterarm',
    'gewerbeenergie': 'Gewerbegebäude mit Photovoltaikanlage auf dem Dach, im Vordergrund ein Umschlag',
}


def bild(slug):
    return (ROOT / 'assets' / 'artikel' / f'{slug}.webp').exists()


def lade(ordner, slug):
    text = (ROOT / 'inhalte' / ordner / f'{slug}.html').read_text(encoding='utf-8')
    m = re.match(r'\s*<!--META (.*?)-->\s*', text, re.S)
    if not m:
        raise SystemExit(f'META fehlt in inhalte/{ordner}/{slug}.html')
    return json.loads(m.group(1)), text[m.end():].strip()


def jsonld(daten):
    return '<script type="application/ld+json">' + json.dumps(daten, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + '</script>'


MAGAZIN = 'Akquise-Wissen'
MARKENKOPF = '<header class="site-header"><nav aria-label="Hauptnavigation" class="navigation container"><a aria-label="Kontaktstoff Startseite" class="wordmark" href="/"><img alt="" class="brand-mark" height="38" src="/assets/logo-k-96.webp" width="38"/><span class="brand-type">kontaktstoff<span class="brand-dot">.</span></span></a><div class="subpage-nav"><a class="subpage-home" href="/">Zur Startseite</a><a class="button button-dark nav-cta" href="/#planen">Kampagne planen <span aria-hidden="true">↗</span></a></div></nav></header>'
NEUTRALER_KOPF = f'<header class="site-header magazine-header"><nav aria-label="Hauptnavigation" class="navigation container"><a class="magazine-mark" href="/ratgeber">{MAGAZIN}<span>Ratgeber für B2B-Neukundengewinnung</span></a><div class="subpage-nav"><a href="/ratgeber">Ratgeber</a><a href="/branchen">Branchen</a></div></nav></header>'


def kopf(titel, beschreibung, pfad, noindex=False, ld=None, og_typ='article', og_bild='/assets/og-image.jpg', neutral=False):
    url = BASE + pfad
    robots = 'noindex, follow' if noindex else 'index, follow, max-image-preview:large, max-snippet:-1'
    return f'''<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>{e(titel)}</title>
<meta content="{e(beschreibung)}" name="description"/>
<meta content="{robots}" name="robots"/>
<link href="{url}" rel="canonical"/>
<meta content="#e2ff54" name="theme-color"/>
<meta content="{og_typ}" property="og:type"/><meta content="{MAGAZIN if neutral else 'Kontaktstoff'}" property="og:site_name"/><meta content="de_DE" property="og:locale"/>
<meta content="{url}" property="og:url"/><meta content="{e(titel)}" property="og:title"/><meta content="{e(beschreibung)}" property="og:description"/>
<meta content="{BASE}{og_bild}" property="og:image"/><meta content="1200" property="og:image:width"/><meta content="630" property="og:image:height"/>
<meta content="summary_large_image" name="twitter:card"/>
<link href="/favicon.ico" rel="icon" sizes="48x48"/><link href="/favicon.svg" rel="icon" type="image/svg+xml"/><link href="/apple-touch-icon.png" rel="apple-touch-icon"/><link href="/site.webmanifest" rel="manifest"/>
<link as="font" crossorigin="" href="/assets/fonts/Manrope-Bold.woff2" rel="preload" type="font/woff2"/><link href="/style.css" rel="stylesheet"/>
{jsonld(ld) if ld else ''}
</head>
<body class="subpage"><a class="skip-link" href="#main">Zum Inhalt</a>
{NEUTRALER_KOPF if neutral else MARKENKOPF}
'''


def footer():
    ratgeber = ''.join(f'<li><a href="/ratgeber/{s}">{e(l)}</a></li>' for s, l in RATGEBER)
    branchen = ''.join(f'<li><a href="/branchen/{s}">{e(lade("branchen", s)[0]["navLabel"])}</a></li>' for s in BRANCHEN)
    recht = ''.join(f'<li><a href="/{s}">{e(l)}</a></li>' for s, l in RECHTLICHES)
    return f'''<footer class="footer"><div class="container footer-grid"><div class="footer-brand"><a aria-label="Kontaktstoff Startseite" class="wordmark" href="/"><img alt="" class="brand-mark" height="38" src="/assets/logo-k-96.webp" width="38"/><span class="brand-type">kontaktstoff<span class="brand-dot">.</span></span></a><p>B2B-Mailing für Neukundengewinnung. Echte Post. Persönlich.</p><a class="text-button" href="/#planen">Kampagne planen ↗</a></div><nav aria-label="Ratgeber" class="footer-col"><h2><a href="/ratgeber">Ratgeber</a></h2><ul>{ratgeber}</ul></nav><nav aria-label="Branchen" class="footer-col"><h2><a href="/branchen">Branchen</a></h2><ul>{branchen}</ul></nav><nav aria-label="Rechtliches" class="footer-col"><h2>Rechtliches</h2><ul>{recht}</ul></nav></div><div class="container footer-bottom"><span>© 2026 Kontaktstoff</span><span>Personalisierte B2B-Postkampagnen aus Deutschland</span></div></footer>'''


def seitenende():
    return '\n' + footer() + '\n</body></html>\n'


def brotkrumen(teile):
    li = []
    for i, (name, pfad) in enumerate(teile):
        if i == len(teile) - 1:
            li.append(f'<li aria-current="page">{e(name)}</li>')
        else:
            li.append(f'<li><a href="{pfad}">{e(name)}</a></li>')
    ld = {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': BASE + p} for i, (n, p) in enumerate(teile)]}
    return f'<nav aria-label="Brotkrumen" class="breadcrumb"><ol>{"".join(li)}</ol></nav>', ld


def faq_block(faq):
    if not faq:
        return '', None
    items = ''.join(f'<details><summary>{e(f["q"])}</summary><p>{e(f["a"])}</p></details>' for f in faq)
    ld = {'@type': 'FAQPage', 'mainEntity': [{'@type': 'Question', 'name': f['q'], 'acceptedAnswer': {'@type': 'Answer', 'text': f['a']}} for f in faq]}
    return f'<section aria-labelledby="faq-titel" class="article-faq"><h2 id="faq-titel">Häufige Fragen</h2><div class="faq-list">{items}</div></section>', ld


CTA = '''<aside class="article-cta"><div><h2>Deine erste Postkampagne durchrechnen</h2><p>Kontakte, Format und Deckungsbeitrag eingeben: Der Kampagnenrechner zeigt Budget und ab wie vielen Neukunden es sich trägt.</p></div><a class="button button-dark" href="/#planen">Kampagne planen <span aria-hidden="true">↗</span></a></aside>'''


def karten(eintraege):
    html_karten = []
    for pfad, kicker, titel, text in eintraege:
        slug = pfad.rstrip('/').rsplit('/', 1)[-1]
        img = ''
        if bild(slug):
            img = f'<img alt="" class="content-card-img" decoding="async" height="360" loading="lazy" src="/assets/artikel/{slug}-640.webp" width="640"/>'
        html_karten.append(f'<a class="content-card" href="{pfad}">{img}<div class="content-card-text"><span class="content-card-kicker">{e(kicker)}</span><h3>{e(titel)}</h3><p>{e(text)}</p><span class="content-card-more">Weiterlesen ↗</span></div></a>')
    return '<div class="card-grid">' + ''.join(html_karten) + '</div>'


def schreibe(pfad, inhalt):
    ziel = ROOT / pfad
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_text(inhalt, encoding='utf-8')


ORG = {'@type': 'Organization', '@id': BASE + '/#organization', 'name': 'Kontaktstoff', 'url': BASE + '/',
       'logo': {'@type': 'ImageObject', 'url': BASE + '/assets/icon-512.png'}}


def inhaltsseite(ordner, slug, meta, body, krumen, kicker, verwandte):
    pfad = f'/{ordner}/{slug}'
    og_bild = f'/assets/artikel/{slug}-og.jpg' if bild(slug) else '/assets/og-image.jpg'
    titelbild = ''
    if bild(slug):
        titelbild = f'<figure class="article-hero"><img alt="{e(BILD_ALT[slug])}" decoding="async" fetchpriority="high" height="900" sizes="(max-width: 860px) 100vw, 780px" src="/assets/artikel/{slug}.webp" srcset="/assets/artikel/{slug}-640.webp 640w, /assets/artikel/{slug}.webp 1600w" width="1600"/></figure>'
    nav, ld_krumen = brotkrumen(krumen)
    faq_html, ld_faq = faq_block(meta.get('faq'))
    haupt = {'@type': 'Article' if ordner == 'ratgeber' else 'WebPage', 'headline': meta['h1'], 'name': meta['h1'],
             'description': meta['description'], 'inLanguage': 'de-DE', 'url': BASE + pfad,
             'mainEntityOfPage': BASE + pfad, 'image': BASE + og_bild,
             'datePublished': STAND, 'dateModified': STAND, 'author': ORG, 'publisher': ORG}
    graph = [haupt, ld_krumen] + ([ld_faq] if ld_faq else [])
    related = karten(verwandte) if verwandte else ''
    seite = kopf(f'{meta["title"]} | {MAGAZIN}', meta['description'], pfad, ld={'@context': 'https://schema.org', '@graph': graph}, og_bild=og_bild, neutral=True)
    seite += f'''<main class="article-page" id="main"><article class="container article">{nav}<header class="article-header"><p class="article-kicker">{e(kicker)}</p><h1>{e(meta["h1"])}</h1><p class="article-lead">{e(meta["lead"])}</p><p class="article-meta">{meta.get("readingMinutes", 6)} Min. Lesezeit · Stand: {STAND_TEXT} · Redaktion {MAGAZIN}</p></header>{titelbild}<div class="article-body">{body}</div>{CTA}{faq_html}</article>'''
    if related:
        seite += f'<section class="container related"><h2>Weiterlesen</h2>{related}</section>'
    seite += '</main>' + seitenende()
    schreibe(f'{ordner}/{slug}.html', seite)


def ratgeber_karte(slug):
    m, _ = lade('ratgeber', slug)
    return (f'/ratgeber/{slug}', 'Ratgeber', m['h1'], m['lead'])


def branchen_karte(slug):
    m, _ = lade('branchen', slug)
    return (f'/branchen/{slug}', 'Branche', m['navLabel'], m['teaser'])


def uebersicht(ordner, titel, h1, lead, beschreibung, eintraege, intro_html=''):
    pfad = f'/{ordner}'
    nav, ld_krumen = brotkrumen([(MAGAZIN, '/ratgeber')] + ([(titel, pfad)] if pfad != '/ratgeber' else []))
    ld = {'@context': 'https://schema.org', '@graph': [
        {'@type': 'CollectionPage', 'name': h1, 'description': beschreibung, 'url': BASE + pfad, 'inLanguage': 'de-DE', 'publisher': ORG,
         'hasPart': [{'@type': 'WebPage', 'url': BASE + p, 'name': t} for p, _, t, _ in eintraege]}, ld_krumen]}
    seite = kopf(f'{h1} | {MAGAZIN}', beschreibung, pfad, ld=ld, og_typ='website', neutral=True)
    seite += f'<main class="article-page" id="main"><div class="container hub">{nav}<header class="article-header"><p class="article-kicker">{e(titel)}</p><h1>{e(h1)}</h1><p class="article-lead">{e(lead)}</p></header>{intro_html}{karten(eintraege)}{CTA}</div></main>' + seitenende()
    schreibe(f'{ordner}/index.html', seite)


RECHT_INHALT = {
    'impressum': ('Impressum', '<p>Die vollständigen Anbieterangaben nach § 5 Digitale-Dienste-Gesetz werden vor dem öffentlichen Marktstart ergänzt: Unternehmensname, Rechtsform, Vertretungsberechtigte, ladungsfähige Anschrift, Kontaktangaben sowie gegebenenfalls Registereintrag und Umsatzsteuer-Identifikationsnummer.</p><p>Diese Website zeigt die Marke und die geplante Leistung von Kontaktstoff. Über die Website können derzeit keine Bestellungen aufgegeben werden.</p>'),
    'datenschutz': ('Datenschutz', '<p>Die Website und der Kampagnenrechner verarbeiten deine Eingaben lokal im Browser. Die Website versendet keine Formulardaten, speichert keine Eingaben und setzt kein eigenes Marketing-Tracking ein.</p><p>Die Schriftdateien werden zusammen mit der Website ausgeliefert. Der Hosting-Anbieter verarbeitet beim Seitenaufruf technische Verbindungsdaten.</p><p>Für den öffentlichen Betrieb werden die verantwortliche Stelle, der Hosting-Dienstleister, die tatsächlichen Verarbeitungen und Kontaktwege in einer vollständigen Datenschutzerklärung ergänzt.</p>'),
    'agb': ('Allgemeine Geschäftsbedingungen', '<p>Die Allgemeinen Geschäftsbedingungen für Kampagnen, Creditpakete und Zusatzservices werden vor dem öffentlichen Marktstart hier veröffentlicht.</p><p>Das Angebot von Kontaktstoff richtet sich an Unternehmen.</p>'),
    'widerruf': ('Widerruf', '<p>Informationen zum Widerruf werden vor dem öffentlichen Marktstart hier veröffentlicht.</p><p>Das Angebot von Kontaktstoff richtet sich an Unternehmen.</p>'),
    'kontakt': ('Kontakt', '<p>Die Kontaktangaben werden vor dem öffentlichen Marktstart ergänzt.</p><p>Du kannst deine Kampagne schon jetzt mit dem <a href="/#planen">Kampagnenrechner</a> planen und dir ein Briefing herunterladen.</p>'),
}


def rechtsseite(slug):
    titel, body = RECHT_INHALT[slug]
    nav, ld_krumen = brotkrumen([('Startseite', '/'), (titel, f'/{slug}')])
    seite = kopf(f'{titel} | Kontaktstoff', f'{titel} von Kontaktstoff, dem Anbieter personalisierter B2B-Postkampagnen.', f'/{slug}', noindex=True, og_typ='website')
    seite += f'<main class="article-page" id="main"><article class="container article">{nav}<header class="article-header"><h1>{e(titel)}</h1></header><div class="article-body">{body}</div></article></main>' + seitenende()
    schreibe(f'{slug}.html', seite)


def fehlerseite():
    seite = kopf('Seite nicht gefunden | Kontaktstoff', 'Diese Seite gibt es nicht.', '/404', noindex=True, og_typ='website')
    seite += f'<main class="article-page" id="main"><div class="container hub"><header class="article-header"><p class="article-kicker">Fehler 404</p><h1>Diese Seite gibt es nicht.</h1><p class="article-lead">Vielleicht findest du im Ratgeber oder bei den Branchen, was du suchst.</p></header>{karten([("/", "Start", "Zur Startseite", "B2B-Mailing für Neukundengewinnung."), ("/ratgeber", "Wissen", "Ratgeber", "Akquise-Methoden, Wirkung von Post, Recht und ROI."), ("/branchen", "Branchen", "Branchen", "Neukundengewinnung für Agenturen, IT, Recruiting, Industrie und Energie.")])}</div></main>' + seitenende()
    schreibe('404.html', seite)


def startseite_footer():
    p = ROOT / 'index.html'
    s = p.read_text(encoding='utf-8')
    neu, n = re.subn(r'<footer class="(?:site-footer container|footer)">.*?</footer>', lambda _m: footer(), s, count=1, flags=re.S)
    if n != 1:
        raise SystemExit('Footer in index.html nicht gefunden')
    p.write_text(neu, encoding='utf-8')


def sitemap():
    urls = [('/', '1.0'), ('/ratgeber', '0.8'), ('/branchen', '0.8')]
    urls += [(f'/ratgeber/{s}', '0.7') for s, _ in RATGEBER] + [(f'/branchen/{s}', '0.7') for s in BRANCHEN]
    zeilen = []
    for pfad, prio in urls:
        bild = ''
        if pfad == '/':
            bild = f'\n    <image:image><image:loc>{BASE}/assets/og-image.jpg</image:loc></image:image>\n    <image:image><image:loc>{BASE}/assets/dashboard-konzept.webp</image:loc></image:image>'
        zeilen.append(f'  <url>\n    <loc>{BASE}{pfad}</loc>\n    <lastmod>{STAND}</lastmod>\n    <priority>{prio}</priority>{bild}\n  </url>')
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + '\n'.join(zeilen) + '\n</urlset>\n'
    schreibe('sitemap.xml', xml)


def main():
    titel_von = {s: l for s, l in RATGEBER}
    for slug, label in RATGEBER:
        meta, body = lade('ratgeber', slug)
        verwandt = [ratgeber_karte(r) for r in meta.get('related', []) if r in titel_von and r != slug][:3]
        inhaltsseite('ratgeber', slug, meta, body, [(MAGAZIN, '/ratgeber'), (label, f'/ratgeber/{slug}')], 'Ratgeber', verwandt)
    for slug in BRANCHEN:
        meta, body = lade('branchen', slug)
        verwandt = [ratgeber_karte(r) for r in meta.get('related', []) if r in titel_von][:3]
        inhaltsseite('branchen', slug, meta, body, [(MAGAZIN, '/ratgeber'), ('Branchen', '/branchen'), (meta['navLabel'], f'/branchen/{slug}')], 'Branche · ' + meta['navLabel'], verwandt)
    uebersicht('ratgeber', 'Ratgeber', 'Wissen für die B2B-Neukundengewinnung',
               'Akquise-Methoden im Vergleich, die Wirkung von Post im Unternehmen, Rechtslage und ROI: kompakt erklärt für Vertrieb und Geschäftsführung.',
               'Ratgeber zur B2B-Neukundengewinnung: Kaltakquise per E-Mail, Telefon und Post im Vergleich, Wirkung von Print-Mailings, Recht und ROI.',
               [ratgeber_karte(s) for s, _ in RATGEBER])
    uebersicht('branchen', 'Branchen', 'Neukundengewinnung per Post nach Branche',
               'Welche Gesprächsanlässe, Formate und Reaktionswege in deiner Branche funktionieren und was ein persönliches B2B-Mailing dort leisten kann.',
               'Neukundengewinnung per B2B-Mailing für Agenturen, IT-Dienstleister, Recruiting, Industrie und Gewerbeenergie: Gesprächsanlässe, Formate, Beispiele.',
               [branchen_karte(s) for s in BRANCHEN])
    for slug, _ in RECHTLICHES:
        rechtsseite(slug)
    fehlerseite()
    startseite_footer()
    sitemap()
    print('Seiten erzeugt.')


if __name__ == '__main__':
    main()
