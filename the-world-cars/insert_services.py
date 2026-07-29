import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://fhmaymnnpwhykxnjrxcv.supabase.co"
SUPABASE_KEY = "sb_publishable_9vbpBotMN8SbWkLf9A97cQ_7gv6BvhN"

def insert(table, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}',
               'Content-Type': 'application/json', 'Prefer': 'return=representation'}
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        response = urllib.request.urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        print(f"  [OK] {payload.get('titolo', payload.get('id_locale',''))}")
        return result[0] if result else None
    except Exception as e:
        print(f"  [ERRORE] {e}")
        return None

print("=" * 60)
print("INSERIMENTO SERVIZI OFFICINA E ASSISTENZA")
print("=" * 60)

# --- SERVIZI OFFICINA ---
print("\nServizi Officina:")
officina_services = [
    {"id_locale": "off-001", "icona": "🔧", "titolo": "Tagliando Completo",
     "descrizione": "Cambio olio, filtri, controllo livelli e ispezione completa del veicolo",
     "tempo_stimato": "2-3 ore", "prezzo": "Da €89"},
    {"id_locale": "off-002", "icona": "🛞", "titolo": "Cambio Gomme & Equilibratura",
     "descrizione": "Sostituzione pneumatici, equilibratura e convergenza ruote",
     "tempo_stimato": "1 ora", "prezzo": "Da €60"},
    {"id_locale": "off-003", "icona": "🔋", "titolo": "Diagnosi Elettronica",
     "descrizione": "Scansione centralina, lettura errori, reset spie e diagnosi computerizzata",
     "tempo_stimato": "30 min", "prezzo": "Da €35"},
    {"id_locale": "off-004", "icona": "🛑", "titolo": "Freni & Dischi",
     "descrizione": "Sostituzione pastiglie freno, dischi e controllo impianto frenante",
     "tempo_stimato": "2 ore", "prezzo": "Da €120"},
    {"id_locale": "off-005", "icona": "❄️", "titolo": "Ricarica Climatizzatore",
     "descrizione": "Ricarica gas R134a/R1234yf, controllo perdite e sanificazione impianto",
     "tempo_stimato": "1 ora", "prezzo": "Da €70"},
    {"id_locale": "off-006", "icona": "⚡", "titolo": "Impianto Elettrico & Batteria",
     "descrizione": "Diagnosi impianto elettrico, sostituzione batteria, riparazione alternatore",
     "tempo_stimato": "1-2 ore", "prezzo": "Da €45"}
]

for svc in officina_services:
    insert('servizi_officina', svc)

# --- SERVIZI ASSISTENZA STRADALE ---
print("\nServizi Assistenza Stradale:")
assistenza_services = [
    {"id_locale": "ast-001", "icona": "🚛", "titolo": "Carro Attrezzi H24",
     "descrizione": "Recupero e trasporto veicolo in panne o incidentato, disponibile 24 ore su 24",
     "tempo_stimato": "20-40 min"},
    {"id_locale": "ast-002", "icona": "🔋", "titolo": "Avviamento Batteria Scarica",
     "descrizione": "Intervento rapido per avviamento con cavi o sostituzione batteria sul posto",
     "tempo_stimato": "15-25 min"},
    {"id_locale": "ast-003", "icona": "🛞", "titolo": "Cambio Gomma Forata",
     "descrizione": "Sostituzione pneumatico forato con ruotino di scorta o riparazione rapida",
     "tempo_stimato": "20-30 min"},
    {"id_locale": "ast-004", "icona": "⛽", "titolo": "Rifornimento Carburante",
     "descrizione": "Consegna carburante di emergenza direttamente sul posto dove ti trovi",
     "tempo_stimato": "25-40 min"},
    {"id_locale": "ast-005", "icona": "🔑", "titolo": "Apertura Auto Chiavi Chiuse",
     "descrizione": "Sblocco portiera in caso di chiavi dimenticate all'interno del veicolo",
     "tempo_stimato": "15-30 min"},
    {"id_locale": "ast-006", "icona": "🚗", "titolo": "Auto Sostitutiva",
     "descrizione": "Fornitura veicolo sostitutivo durante la riparazione della tua auto",
     "tempo_stimato": "Immediato"}
]

for svc in assistenza_services:
    insert('servizi_assistenza', svc)

print("\nFATTO! Tutti i servizi sono stati inseriti nel database.")
