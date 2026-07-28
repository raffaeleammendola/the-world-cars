import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://fhmaymnnpwhykxnjrxcv.supabase.co"
SUPABASE_KEY = "sb_publishable_9vbpBotMN8SbWkLf9A97cQ_7gv6BvhN"

def get(table):
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}',
               'Content-Type': 'application/json'}
    req = urllib.request.Request(url, headers=headers, method='GET')
    try:
        response = urllib.request.urlopen(req)
        return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Errore GET {table}: {e}")
        return None

print("Controllo tabella configurazione...")
res = get('configurazione')
print(json.dumps(res, indent=2))
