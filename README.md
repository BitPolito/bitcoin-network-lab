# Come funziona Bitcoin · Nodi, mempool e transazioni

Webapp interattiva a passi per il workshop di Lugano, realizzata nello stile di [BitPolito](https://www.bitpolito.it).
Mostra in 8 passi cosa succede in una rete Bitcoin: chi ne fa parte, come viaggia una transazione, come nasce un blocco e perché nessuno deve fidarsi di nessuno.

HTML, CSS e JavaScript puri: nessuna dipendenza, nessuna fase di build.

## Avvio

Apri `index.html` nel browser. In alternativa, con un server locale:

```bash
python3 -m http.server 8000
# poi vai su http://localhost:8000
```

Servono solo i Google Fonts (Plus Jakarta Sans), con fallback sui font di sistema se offline.

## I passi

| # | Passo | Cosa mostra |
|---|-------|-------------|
| 1 | Nodi | Full node, miner e wallet SPV nella rete |
| 2 | Transazione | Il wallet firma e invia una tx; ogni full node la valida e la inoltra (gossip) |
| 3 | Mempool | Altro traffico: le tx si ordinano per fee |
| 4 | Blocco | Il miner prende le tx con fee più alta, mina il blocco e lo propaga |
| 5 | SPV | Prova di Merkle: l'albero con foglie, fratelli, radice e confronto con l'intestazione |
| 6 | Double spend | La seconda spesa degli stessi fondi viene rifiutata da tutti i nodi |
| 7 | Regole | Un blocco che viola il sussidio viene scartato dai full node |
| 8 | Resilienza | Un nodo va offline, la rete continua e lui si risincronizza |

## Uso

- **Pulsante centrale** (o `Spazio` / `Invio`): esegue l'azione del passo corrente.
- **Indietro / Avanti** (o `←` / `→`, `PagUp` / `PagGiù`, swipe su touch): cambia passo.
- **Interruttore in alto a destra**: tema chiaro/scuro (salvato in `localStorage`).

Il layout è responsive (telefono in verticale, schermi bassi) e rispetta `prefers-reduced-motion`.

## Struttura

```
index.html   struttura della pagina
style.css    stile BitPolito, layout responsive, albero di Merkle
app.js       stato, animazioni e definizione dei passi
assets/      logo, icone e favicon
```

### Come funziona `app.js`

- `N` ed `E`: nodi e collegamenti della rete (disegnata in SVG); `layout()` sceglie la disposizione orizzontale o compatta.
- `S`: stato della simulazione (transazioni, timechain, passo corrente).
- `gossip()` / `fly()`: propagazione animata di tx e blocchi tra i vicini.
- `merkle(ids)`: calcola l'albero di Merkle di un blocco (3 tx, la quarta foglia duplica l'ultima come in Bitcoin).
- `drawTree()` / `prove()`: disegnano e animano la prova di Merkle del passo 5.
- `STEPS`: titolo, descrizione, etichetta del pulsante e azione `f` di ogni passo. Per aggiungere un passo basta un nuovo elemento, più la sua etichetta in `LB`.

### Nota sugli hash

Gli hash sono una funzione didattica (djb2) e **non sono SHA-256**: servono solo a rendere visibile la struttura. Fee, id delle tx e traffico sono casuali a ogni esecuzione.

## Crediti

Fatto con ♥ da BitPolito · © 2026
