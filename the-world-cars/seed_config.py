import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://fhmaymnnpwhykxnjrxcv.supabase.co"
SUPABASE_KEY = "sb_publishable_9vbpBotMN8SbWkLf9A97cQ_7gv6BvhN"

def post(table, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}',
               'Content-Type': 'application/json', 'Prefer': 'return=representation'}
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        response = urllib.request.urlopen(req)
        return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Errore POST {table}: {e}")
        return None

payload = {
  "id": 1,
  "nome_azienda": "The World Cars Elettrauto - Meccanico - Soccorso Stradale",
  "indirizzo": "Corso Resina, 314/D, 80056 Ercolano NA",
  "telefono": "+39 081 7776655",
  "telefono_emergenza": "+39 333 9988776",
  "whatsapp": "393339988776",
  "email": "info@theworldcars.it",
  "logo_icona": "🏎️",
  "telegram_bot_token": "8743722064:AAEH5j4pZCfnXaG5KswNXaakA66-tiH5HXU",
  "telegram_chat_id": "573990897",
  "password_hash": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
}

print("Inserimento riga configurazione in corso...")
res = post('configurazione', payload)
print("Risultato:", res)
