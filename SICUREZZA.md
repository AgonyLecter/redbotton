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
cd dist && zip -r ../bottone-rosso.zip .
```
Su itch.io: *Kind of project* → **HTML**, carica lo zip, spunta *This file will be played in the browser*,
abilita **Mobile friendly** e **Fullscreen button**.
Carica sempre la versione di `dist/`, non l'`index.html` del repository.

Ricorda di rendere **privato** il repository GitHub (o di non linkarlo): altrimenti il codice
leggibile è comunque lì.

## Il narratore che risponde (IA) — facoltativo
Il pulsante **PARLA** e le domande aperte funzionano sempre: senza IA risponde un motore
interno che usa solo fatti veri (ora, minuti di gioco, finali, frasi scritte prima).
Per farlo rispondere con un'intelligenza artificiale (Claude):

1. Crea una chiave API su https://console.anthropic.com (sezione *API Keys*).
2. Su **Vercel → il progetto → Settings → Environment Variables** aggiungi
   `ANTHROPIC_API_KEY` = la tua chiave (ambiente *Production*), poi rifai il deploy.
   La chiave resta sul server, nel file `api/narratore.js`: **non finisce mai nel gioco**.
3. Per la versione **itch.io** l'indirizzo è già impostato (`NARR_URL` = https://redbotton.vercel.app/api/narratore); se cambi sito, aggiorna la costante `NARR_URL`
   in `index.html`, ad esempio `https://il-tuo-sito.vercel.app/api/narratore`, e rifai lo zip.
   Se usi un dominio tuo (non `.vercel.app`), aggiungi su Vercel anche
   `SITE_HOST` = il tuo dominio (es. `gioco.miosito.it`).

Protezioni già attive: la funzione accetta richieste solo da itch.io, da `*.vercel.app`
e da `SITE_HOST`; massimo 8 messaggi al minuto per indirizzo; massimo 30 risposte IA per
partita; testi tagliati a 400 caratteri. Il narratore riceve solo quello che il giocatore
scrive al narratore e pochi fatti di gioco (nome, capitolo, ora, minuti, finali), mai la posizione
o altri dati. Se il giocatore scrive frasi su farsi del male, il gioco **non** le manda all'IA:
esce dal personaggio e mostra Telefono Amico (02 2327 2327) e il 112.

Costo indicativo con il modello attuale (`claude-opus-5-5`): circa mezzo centesimo di dollaro a
risposta. Puoi mettere un tetto di spesa mensile nella console di Anthropic (*Limits*).
