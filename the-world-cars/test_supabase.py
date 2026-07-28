import urllib.request
import urllib.error
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://fhmaymnnpwhykxnjrxcv.supabase.co"
SUPABASE_KEY = "sb_publishable_9vbpBotMN8SbWkLf9A97cQ_7gv6BvhN"

def get_columns(table_name):
    """Legge 0 righe ma ottiene le colonne dalla risposta headers"""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?limit=0"
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}',
               'Prefer': 'return=representation'}
    req = urllib.request.Request(url, headers=headers)
    try:
        response = urllib.request.urlopen(req)
        # Le colonne le prendiamo dal Content-Profile header o facendo un HEAD
        # Proviamo a fare un select con limit=0 e poi un insert fittizio per capire le colonne
        return True
    except:
        return False

def test_rls_insert(table_name, payload):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}',
               'Content-Type': 'application/json', 'Prefer': 'return=representation'}
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        response = urllib.request.urlopen(req)
        result = json.loads(response.read().decode('utf-8'))
        row = result[0] if result else {}
        print(f"  [OK] INSERT {table_name} - Colonne salvate: {list(row.keys())}")
        return row
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        err = json.loads(body)
        if '42501' in str(err.get('code','')):
            print(f"  [BLOCCATO] {table_name} - RLS ancora attivo! Serve GRANT + DISABLE RLS")
        elif '42703' in str(err.get('code','')) or '23502' in str(err.get('code','')):
            print(f"  [COLONNA] {table_name} - Errore colonna: {err.get('message','')[:100]}")
        else:
            print(f"  [ERRORE] {table_name} - {err.get('code','')}: {err.get('message','')[:100]}")
        return None

def test_delete(table_name, filter_str):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?{filter_str}"
    headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'}
    req = urllib.request.Request(url, headers=headers, method='DELETE')
    try: urllib.request.urlopen(req)
    except: pass

print("=" * 60)
print("VERIFICA COMPLETA TABELLE + RLS + FK")
print("=" * 60)

# Test INSERT su ogni tabella
print("\n1. Test INSERT clienti:")
c = test_rls_insert('clienti', {'nome':'Test','telefono':'333','email':'t@t.com'})

print("\n2. Test INSERT auto:")
a = test_rls_insert('auto', {
    'id_locale':'test-v','marca':'BMW','modello':'X5','categoria':'SUV',
    'cambio':'Auto','carburante':'Diesel','posti':5,'bagagli':'3',
    'immagine':'test.jpg','prezzo_giorno':100,'prezzo_settimana':600,
    'disponibile':True,'descrizione':'Test'
})

print("\n3. Test INSERT servizi_officina:")
so = test_rls_insert('servizi_officina', {
    'id_locale':'off-test','icona':'wrench','titolo':'Tagliando',
    'descrizione':'Test','tempo_stimato':'1h','prezzo':'Da 80EUR'
})

print("\n4. Test INSERT servizi_assistenza:")
sa = test_rls_insert('servizi_assistenza', {
    'id_locale':'ast-test','icona':'truck','titolo':'Carro Attrezzi',
    'descrizione':'Test','tempo_stimato':'30min'
})

print("\n5. Test INSERT richieste (con FK):")
if c and a and so and sa:
    r = test_rls_insert('richieste', {
        'id_locale':'req-test','tipo':'Noleggio',
        'cliente_id': c['id'], 'auto_id': a['id'],
        'servizio_officina_id': so['id'], 'servizio_assistenza_id': sa['id'],
        'nome_cliente':'Test','telefono':'333','stato':'Nuova'
    })
    if r:
        print(f"\n  >> FK cliente_id = {c['id']}")
        print(f"  >> FK auto_id = {a['id']}")
        print(f"  >> FK servizio_officina_id = {so['id']}")
        print(f"  >> FK servizio_assistenza_id = {sa['id']}")
        print("\n  TUTTE LE RELAZIONI FK FUNZIONANO!")
    
    # Cleanup
    print("\n6. Pulizia dati di test...")
    test_delete('richieste','id_locale=eq.req-test')
    test_delete('auto','id_locale=eq.test-v')
    test_delete('servizi_officina','id_locale=eq.off-test')
    test_delete('servizi_assistenza','id_locale=eq.ast-test')
    if c: test_delete('clienti',f"id=eq.{c['id']}")
    print("  Pulizia completata.")
elif c is None or a is None:
    print("\n  >> Non posso testare le FK perche le INSERT sono bloccate da RLS.")
    print("  >> Devi eseguire il GRANT + DISABLE RLS su Supabase!")

print("\n" + "=" * 60)
