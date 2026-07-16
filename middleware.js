// Passwortschutz (Basic Auth) für die gesamte Seite, bis wir live gehen.
// Aktiv nur, wenn in Vercel die Env-Variable PREVIEW_PASSWORD gesetzt ist.
// Go-live: Env-Variable löschen + Redeploy (oder diese Datei entfernen).

export const config = {
  matcher: '/(.*)',
};

export default function middleware(request) {
  const password = process.env.PREVIEW_PASSWORD;
  if (!password) return; // kein Passwort gesetzt → Seite ist offen

  const auth = request.headers.get('authorization') || '';
  const expected = 'Basic ' + btoa('preview:' + password);
  if (auth === expected) return; // korrekt eingeloggt → durchlassen

  return new Response('Zugang geschützt – bitte anmelden.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Aquaservice Preview", charset="UTF-8"',
    },
  });
}
