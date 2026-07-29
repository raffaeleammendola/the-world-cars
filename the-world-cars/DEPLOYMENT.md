# Guida alla Pubblicazione Online: Vercel + Supabase Database

Guida passo-passo per pubblicare **THE WORLD CARS** in produzione con un costo pari a zero (€0) utilizzando **Vercel** per l'hosting frontend/serverless ed un Database **Supabase Free Tier**.

---

## 🗄️ PARTE 1: Configurazione Database Cloud Supabase

1. **Registrazione Gratuita**:
   - Accedi a [https://supabase.com](https://supabase.com) e crea un account gratuito.
   - Clicca su **"New Project"**, scegli un nome (es. `the-world-cars-db`) ed una password per il database.
   - Scegli la regione geografica **Frankfurt (eu-central-1)** o la più vicina all'Italia per la massima velocità.

2. **Creazione Tabelle & Schema**:
   - Dalla Dashboard Supabase, entra nella sezione **"SQL Editor"** nel menu a sinistra.
   - Apri il file [supabase_schema.sql](file:///C:/Users/raffa/.gemini/antigravity/scratch/the-world-cars/supabase_schema.sql), copia l'intero contenuto ed incollalo nell'editor SQL di Supabase.
   - Clicca su **"RUN"**. Le 6 tabelle (`clienti`, `richieste`, `auto`, `noleggi`, `officina`, `assistenza`) verranno create immediatamente con le politiche di sicurezza RLS e la flotta auto iniziale.

3. **Recupero API Keys**:
   - Vai in **Project Settings ⚙️ ➔ API**.
   - Copia i valori di:
     - `Project URL` (es. `https://xyzpdq.supabase.co`)
     - `anon public key` (es. `eyJhbGciOi...`)

---

## 🤖 PARTE 2: Configurazione Bot Telegram

1. Apri Telegram sul tuo smartphone o PC e cerca **`@BotFather`**.
2. Invia il comando `/newbot` e segui le istruzioni per impostare il nome (es. `TheWorldCarsBot`).
3. Copia il **Bot Token** rilasciato (es. `123456789:ABCdefGhIJK...`).
4. Per ottenere il tuo **Chat ID**:
   - Cerca il bot **`@userinfobot`** su Telegram ed inviagli un messaggio. Ti risponderà con il tuo `Id` numerico.
   - Se preferisci inviare le notifiche in un Gruppo o Canale Telegram, aggiungi il tuo bot al gruppo, promuovilo ad amministratore ed ottieni l'ID del canale (es. `-100123456789`).

---

## 🚀 PARTE 3: Deploy su Vercel Hosting

1. **Caricamento Repository**:
   - Crea una repository su GitHub/GitLab (es. `the-world-cars`).
   - Carica l'intero contenuto della cartella `the-world-cars`.

2. **Collegamento Vercel**:
   - Accedi a [https://vercel.com](https://vercel.com) (puoi registrarti gratis tramite GitHub).
   - Clicca su **"Add New..." ➔ "Project"** e seleziona la tua repository `the-world-cars`.

3. **Impostazione Variabili d'Ambiente su Vercel**:
   - Nella sezione **"Environment Variables"** prima di fare il deploy, inserisci:

   | Nome Variabile | Valore |
   | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Il tuo Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La tua Supabase Anon Public Key |
   | `TELEGRAM_BOT_TOKEN` | Il Token ottenuto da `@BotFather` |
   | `TELEGRAM_CHAT_ID` | Il tuo ID Chat o ID Canale Telegram |

4. **Deploy**:
   - Clicca su **"Deploy"**. Entro poche decine di secondi il tuo sito sarà live su un indirizzo tipo `the-world-cars.vercel.app` con certificato SSL HTTPS attivo.

---

## 🌐 PARTE 4: Collegamento Dominio Personalizzato (es. www.theworldcars.it)

1. Nel pannello di controllo Vercel del tuo progetto, vai in **Settings ➔ Domains**.
2. Inserisci il tuo dominio acquistato (es. `theworldcars.it` o `www.theworldcars.it`).
3. Vercel ti fornirà i record DNS da inserire nel pannello del tuo registrar (Aruba, Namecheap, GoDaddy...):
   - Record `A` per il dominio root `theworldcars.it` ➔ `76.76.21.21`
   - Record `CNAME` per `www` ➔ `cname.vercel-dns.com`
4. Il certificato SSL gratuito viene emesso automaticamente da Vercel.
