## Aggiornamento chiave service_role esterna

Il secret `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` contiene attualmente la chiave `anon` del progetto `ruopxyprezzxoirfrjrm`, che è soggetta a RLS e restituisce zero righe su `licenses` / `puk_codes`. Va sostituita con la vera `service_role`.

### Nota importante sul valore
Il tuo messaggio contiene il placeholder `[INCOLLA QUI LA CHIAVE service_role CHE HAI APPENA COPIATO]` — la chiave non è stata effettivamente incollata. Inoltre, per sicurezza, **non devi mai incollare una service_role in chat in chiaro**: verrebbe salvata nella cronologia del progetto.

### Passi
1. Aprirò il form sicuro tramite `update_secret` per `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY`. Tu incolli lì il valore, che viene salvato criptato senza finire nei log della chat.
2. Nessuna modifica al codice: `src/integrations/supabase/client.external.ts` e `src/lib/license.functions.ts` già leggono `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` e useranno automaticamente il nuovo valore.
3. Verifica: chiamerò `verifyAndActivateLicense` con `TESTER-002MinFat` + PUK per confermare che il client esterno legge correttamente da `ruopxyprezzxoirfrjrm` bypassando RLS.

### Dove trovare la chiave
Nel progetto Supabase esterno → Project Settings → API keys → `service_role` (⚠️ *secret*, non `anon`/`public`). Deve iniziare con `eyJ...` e, decodificata, contenere `"role":"service_role"`.

Confermi e procedo con l'apertura del form sicuro?
