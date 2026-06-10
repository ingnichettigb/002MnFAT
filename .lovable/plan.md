Il problema nello screenshot è che i tre campi che dovrebbero essere “uno solo alla volta” stanno ancora apparendo come quadratini con pallino nero già dentro. Quindi il PDF non sta usando correttamente campi esclusivi visivamente vuoti.

Piano di intervento:

1. Sostituire i radio button attuali per:
   - ACCETTATO
   - NON ACCETTATO
   - NON APPLICABILE
   con un unico gruppo esclusivo: scegliendone uno, l'altro si spegne automaticamente.

2. Fare la stessa cosa per:
   - DEFINITIVO
   - PROVVISORIO
   - DA DEFINIRE
   anche loro come unico gruppo esclusivo.

3. Lasciare invece DA COMPLETARE come checkbox separata e indipendente, quindi può essere spuntata insieme a una delle tre scelte dell'esito.

4. Togliere il pallino nero iniziale: i campi devono partire vuoti. Il bordo blu deve restare disegnato sulla pagina, così si vede anche in stampa.

5. Se il componente radio di jsPDF continua a renderizzare male i quadratini, cambio approccio: userò checkbox PDF normali ma collegate con azione JavaScript interna al PDF. In pratica, quando clicchi ACCETTATO, il PDF spegne automaticamente NON ACCETTATO e NON APPLICABILE. Questo mantiene l'aspetto a quadratino che vuoi e ottiene il comportamento corretto.

6. Dopo la modifica genero/verifico il PDF visivamente: controllo che i quadratini siano vuoti all'apertura, abbiano bordo blu, e che la selezione sia esclusiva nei due gruppi mentre DA COMPLETARE resti indipendente.