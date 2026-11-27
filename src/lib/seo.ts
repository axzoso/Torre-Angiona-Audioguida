// Dati per i motori di ricerca: URL del sito e dati strutturati (JSON-LD,
// schema.org). Il JSON-LD dice a Google e alle AI *che cosa* è la Torre:
// un'attrazione chiamata Torre Angioina, a lungo nota come Torre Normanna,
// con un'audioguida pubblicata dall'Associazione Fuori le Mura.

export const SITE = 'https://torreviva.fuorilemura.org';

/** URL assoluto di un percorso del sito ("/tappa/1/" → "https://…/tappa/1/"). */
export const abs = (path: string) => new URL(path, SITE).href;

export const ID = {
  website: abs('/#website'),
  org: abs('/#organizzazione'),
  torre: abs('/#torre'),
  audioguida: abs('/#audioguida'),
};

/** Immagine per le anteprime dei link (WhatsApp, Facebook, Google). */
export const OG_IMAGE = { path: '/og-torre-viva.png', width: 1200, height: 630, alt: 'Torre Viva, audioguida della Torre Angioina di San Marco Argentano' };

/** "3:21" → "PT3M21S" (durata ISO 8601). */
export function isoDuration(durata: string): string | undefined {
  const m = /^(\d+):(\d{2})$/.exec(durata.trim());
  return m ? `PT${Number(m[1])}M${Number(m[2])}S` : undefined;
}

/** Riassunto per la meta description: taglia a una parola intera. */
export function summary(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.…]+$/, '') + '…';
}

const torre = {
  '@type': ['TouristAttraction', 'LandmarksOrHistoricalBuildings'],
  '@id': ID.torre,
  name: 'Torre Angioina di San Marco Argentano',
  alternateName: [
    'Torre Angioina',
    'Torre di San Marco Argentano',
    'Torre Normanna',
    'Torre Normanna di San Marco Argentano',
  ],
  description:
    'Torre cilindrica di quasi trenta metri a San Marco Argentano (Cosenza), ultimo bastione dell’abitato medievale. ' +
    'Per lungo tempo ritenuta di epoca normanna, è oggi datata dagli studi tra la fine del XIII e il XIV secolo, in età angioina.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Marco Argentano',
    addressRegion: 'CS',
    postalCode: '87018',
    addressCountry: 'IT',
  },
  containedInPlace: { '@type': 'City', name: 'San Marco Argentano' },
  touristType: 'Turismo culturale',
  subjectOf: { '@id': ID.audioguida },
};

const org = {
  '@type': 'Organization',
  '@id': ID.org,
  name: 'Associazione Fuori le Mura',
  alternateName: 'Fuori le Mura',
  url: 'https://fuorilemura.org/',
};

/** Grafo della home: sito, associazione, Torre e audioguida con le sue tappe. */
export function homeJsonLd(tappe: { id: number; titolo: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': ID.website,
        url: abs('/'),
        name: 'Torre Viva',
        alternateName: 'Torre Viva — Audioguida della Torre Angioina',
        inLanguage: 'it',
        publisher: { '@id': ID.org },
        about: { '@id': ID.torre },
      },
      org,
      torre,
      {
        '@type': 'CreativeWork',
        '@id': ID.audioguida,
        name: 'Torre Viva — Audioguida della Torre Angioina di San Marco Argentano',
        description:
          'Audioguida in otto tappe della Torre Angioina di San Marco Argentano, raccontata da Raynaldo di Sancti Marci, fabbro e scutifer della Torre.',
        url: abs('/'),
        inLanguage: 'it',
        about: { '@id': ID.torre },
        publisher: { '@id': ID.org },
        hasPart: tappe.map((s) => ({ '@id': abs(`/tappa/${s.id}/#audio`), name: s.titolo, url: abs(`/tappa/${s.id}/`) })),
      },
    ],
  };
}

/** Grafo di una tappa: l'audio con la trascrizione e il percorso di briciole. */
export function tappaJsonLd(s: { id: number; titolo: string; descrizione: string; audioSrc: string; durata: string; posizione?: string }) {
  const url = abs(`/tappa/${s.id}/`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AudioObject',
        '@id': `${url}#audio`,
        name: `${s.titolo} — Torre Angioina di San Marco Argentano`,
        description: summary(s.descrizione, 300),
        url,
        contentUrl: abs(s.audioSrc),
        encodingFormat: 'audio/mpeg',
        duration: isoDuration(s.durata),
        inLanguage: 'it',
        transcript: s.descrizione,
        ...(s.posizione ? { contentLocation: { '@type': 'Place', name: `${s.posizione}, Torre Angioina di San Marco Argentano` } } : {}),
        about: { '@id': ID.torre },
        isPartOf: { '@id': ID.audioguida },
        publisher: { '@id': ID.org },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Torre Viva', item: abs('/') },
          { '@type': 'ListItem', position: 2, name: s.titolo, item: url },
        ],
      },
    ],
  };
}
