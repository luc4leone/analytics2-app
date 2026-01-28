1. seleziona index.html e pigia GO Live in bottom bar Editor
2. in Terminal esegui:npm run dev:css

---
Extra spiegazione:

Questo ricompila automaticamente dist/style.css quando modifichi:

style.css (input Tailwind + tuoi componenti BEM con @apply)
file HTML/JS (perché Tailwind “scansiona” le classi usate e rigenera le utilities)
2) Live Server che ricarica il browser
Live Server di solito:

auto-inietta cambi CSS senza refresh
oppure auto-refresh la pagina quando cambiano i file
Dato che noi carichiamo dist/style.css, e npm run dev:css modifica proprio quel file, nella maggior parte dei casi vedrai le modifiche senza ricaricare manualmente.

Possibili eccezioni (normali)
Se noti che ogni tanto non aggiorna:
fai un refresh manuale (Cmd+R) una volta
Se hai aperto index.html direttamente come file (file:///...) e non via Live Server:
allora non avrai auto-reload affidabile. Meglio sempre Go Live.