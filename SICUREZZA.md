# Sicurezza: pubblicare "Il Bottone Rosso" su itch.io

## La verità in breve
Un gioco HTML gira **nel browser del giocatore**: il codice e la configurazione Firebase
arrivano sempre sul suo computer. Nessun trucco può renderli davvero invisibili.
La configurazione Firebase (`apiKey`, `projectId`…) **non è un segreto**: Google la progetta
per essere pubblica. Chi la vede non può fare nulla se il database è chiuso bene.

Quindi la protezione vera si fa **sul server (Firebase)**, mentre la pagina si limita a rendere la vita difficile ai curiosi.

## Cosa è già nel codice
- **Login anonimo Firebase**: ogni giocatore riceve un ID firmato da Google e può scrivere solo nel proprio ramo.
- **Content-Security-Policy**: la pagina carica script solo da jsdelivr (three.js) e gstatic (Firebase); niente script iniettati da altri siti.
- **Testo del giocatore sempre "escapato"** (nome, confessione): niente HTML/script iniettabile nei finali.
- **Deterrenti**: tasto destro, F12, Ctrl+U/Ctrl+S/Ctrl+Shift+I bloccati (e il narratore se ne accorge 😈).
- **Build offuscata** (`npm run build`): il codice caricato su itch.io è illeggibile a occhio nudo.

## Cosa DEVI fare tu nella console Firebase (5 minuti)
1. **Authentication → Sign-in method → Anonimo → Abilita.**
   Senza questo il gioco funziona lo stesso, ma senza contatore globale.
2. **Realtime Database → Regole**: incolla il contenuto di `database.rules.json` e pubblica.
   ⚠️ Il progetto `wandernaturelogin` sembra usato anche da un'altra app: se quel database
   contiene altri dati, **non sostituire tutto**, ma aggiungi solo il blocco `"stanza"` dentro
   le regole esistenti (e controlla che le regole esistenti non lascino `".read": true` o
   `".write": true` alla radice).
3. **Google Cloud Console → API e servizi → Credenziali → la tua API key → Restrizioni applicazione:
   referrer HTTP**, e aggiungi:
   - `https://*.itch.zone/*`
   - `https://*.itch.io/*`
   - `https://*.hwcdn.net/*` (CDN di itch)
   - il tuo dominio GitHub Pages, se lo usi
4. *(Consigliato)* **App Check**: Firebase → App Check → registra l'app web con reCAPTCHA v3,
   copia la **site key** nella costante `APPCHECK_KEY` in `index.html` e attiva l'enforcement
   per Realtime Database. Così solo la tua pagina può parlare col database.
   Su reCAPTCHA aggiungi i domini `itch.zone` e `itch.io`.

## Come pubblicare su itch.io
```bash
npm install
npm run build          # crea dist/index.html offuscato
cd dist && zip -r ../bottone-rosso.zip index.html
```
Su itch.io: *Kind of project* → **HTML**, carica lo zip, spunta *This file will be played in the browser*,
abilita **Mobile friendly** e **Fullscreen button**.
Carica sempre la versione di `dist/`, non l'`index.html` del repository.

Ricorda di rendere **privato** il repository GitHub (o di non linkarlo): altrimenti il codice
leggibile è comunque lì.
