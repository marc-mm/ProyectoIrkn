# Vista Avançada Realista (funcionalitat extra)

Globus terraqüi 3D amb trànsit aeri mundial simulat (o real, en directe), detecció i resolució de
conflictes en 3D i connexió amb el projecte original (base de dades de companyies i plans de vol).

Tot el que és d'aquesta funcionalitat viu dins d'aquesta carpeta. Del projecte original només
s'han tocat: la referència a aquest projecte a `ProyectoFormularios.csproj` i el botó
"Vista Avançada Realista" de `Programa_principal`.

## Estructura

| Carpeta / fitxer | Què hi ha |
|---|---|
| `Vista_avanzada.cs` | Formulari WinForms que conté el navegador WebView2 i fa de pont C# <-> JavaScript |
| `Motor/` | "Cervell" en C#: geografia, aeroports, aerolínies, vols, simulació, conflictes, dades en directe |
| `Datos/` | `aeropuertos.csv` (OurAirports, domini públic), `aerolineas.csv`, `tipos_avion.csv` |
| `web/` | Visor 3D: `index.html`, `css/`, `js/` (three.js), `img/` (textures NASA, domini públic), `lib/` (three.js r170, MIT) |

## Com funciona

1. `Vista_avanzada` crea el WebView2, mapeja la carpeta `web/` al domini virtual
   `https://vistaavancada.local/` i obre `index.html`.
2. La pàgina, quan està llesta, envia `{"tipo":"listo"}`. El C# respon amb el missatge `inicio`.
3. Un temporitzador (~20 vegades per segon) fa avançar el `MotorSimulacion` i envia el missatge
   `estado` amb la posició de tots els avions. El JavaScript només dibuixa.
4. Els clics i botons de la pàgina envien ordres al C# (seleccionar avió, canviar l'escala de temps...).

## Protocol de missatges (JSON)

C# -> JS amb `CoreWebView2.PostWebMessageAsJson(json)`; JS -> C# amb
`window.chrome.webview.postMessage(objecte)`. Totes les claus en minúscula, com a l'exemple.
Hores en ISO 8601 UTC (`"2026-11-23T12:34:56Z"`). Altituds en peus, velocitats en nusos,
distàncies en milles nàutiques (NM), rumbs en graus (0 = nord, sentit horari).

### C# -> JS

`inicio` (un sol cop, i de nou si canvia el mode):
```json
{"tipo":"inicio","modo":"simulado","hora":"...Z","escala":60,
 "aeropuertos":[["BCN","Barcelona-El Prat","Barcelona","ES",41.2971,2.0785,3]],
 "aerolineas":[["IBE","Iberia","#D7192D"]],
 "fases":["Rodatge","Enlairament","Pujada","Creuer","Descens","Aproximació","Aterrat"]}
```
- `aeropuertos[i]` = `[iata, nom, ciutat, país, lat, lon, pes]`; `pes` 0..5 = importància (nombre de hubs, mida del marcador).
- `aerolineas[i]` = `[icao, nom, color]`. Els vols hi fan referència per índex.

`estado` (~20 Hz):
```json
{"tipo":"estado","hora":"...Z","escala":60,"pausado":false,"modo":"simulado",
 "vuelos":[[17,41.5,2.3,35000,45.0,460,3,0,"IBE3145"]],
 "conflictos":[[17,42,3.8,500]]}
```
- `vuelos[i]` = `[id, lat, lon, altitudFt, rumbo, velocidadKt, faseIdx, aerolineaIdx, callsign]`.
  `aerolineaIdx` = -1 si és un vol sense aerolínia coneguda (dades en directe) i -2 si és un pla de vol del projecte original.
- `conflictos[i]` = `[idA, idB, distanciaNM, diferenciaAltitudFt]`.
- Entre dos `estado`, el JS pot extrapolar la posició amb el rumb, la velocitat i l'`escala` perquè el moviment sigui fluid a 60 fps.

`infoVuelo` (en seleccionar un avió i, després, cada segon mentre estigui seleccionat):
```json
{"tipo":"infoVuelo","id":17,"callsign":"IBE3145","aerolinea":"Iberia","color":"#D7192D",
 "tipoAvion":"A320","nombreAvion":"Airbus A320neo","matricula":"EC-NJM",
 "origen":{"iata":"BCN","nombre":"...","ciudad":"Barcelona","lat":41.29,"lon":2.07},
 "destino":{"iata":"LHR","nombre":"...","ciudad":"London","lat":51.47,"lon":-0.45},
 "salida":"...Z","llegada":"...Z","fase":"Creuer","altitudFt":35000,"velocidadKt":460,
 "rumbo":330.5,"velVerticalFpm":0,"progreso":0.42,"distanciaTotalNM":620,"distanciaRestanteNM":360,
 "nivelCrucero":350,"ruta":[[41.29,2.07],[42.1,1.8]],"recorrido":[[41.29,2.07],[41.9,1.9]],
 "contacto":{"nombre":"Iberia","telefono":"910000101","email":"iberia@example.com"},
 "enConflicto":false,"instrucciones":["IBE3145: pugi a FL370"]}
```
- `ruta` = tota la ruta ortodròmica (uns 64 punts); `recorrido` = el tros ja volat.
- `contacto` surt de la taula `companias` de la base de dades del projecte (`null` si no hi és).
- En mode directe, els camps desconeguts (origen, destí...) són `null`.

`infoAeropuerto` (en seleccionar un aeroport i cada 2 segons mentre estigui seleccionat):
```json
{"tipo":"infoAeropuerto","iata":"BCN","icao":"LEBL","nombre":"...","ciudad":"Barcelona","pais":"ES",
 "lat":41.29,"lon":2.07,"elevacionFt":12,"horaLocal":"13:34",
 "salidas":[["13:40","IBE3145","LHR","London","Embarcant"]],
 "llegadas":[["13:55","VLG7721","CDG","Paris","En vol"]]}
```

`estadisticas` (cada 2 segons):
```json
{"tipo":"estadisticas","enVuelo":812,"enTierra":95,"porFase":[30,12,140,500,90,40,5],
 "topAerolineas":[["Ryanair",61]],"topAeropuertos":[["LHR",24]],
 "porContinente":[["EU",230],["NA",260]],"conflictosActivos":2,"conflictosResueltos":14}
```

`aviso`: `{"tipo":"aviso","nivel":"info","texto":"..."}` (`nivel`: `info`, `ok`, `error`).

`volarA` (moure la càmera): `{"tipo":"volarA","lat":41.3,"lon":2.1,"distancia":0.25}` (`distancia` en radis terrestres sobre la superfície).

`planesProyecto` (en activar el mode del projecte original):
```json
{"tipo":"planesProyecto","centro":[41.2971,2.0785],
 "caja":[[41.96,1.19],[41.96,2.97],[40.63,2.97],[40.63,1.19]],"distanciaSeguridadNM":2.5}
```

### JS -> C#

| Missatge | Què fa |
|---|---|
| `{"tipo":"listo"}` | La pàgina està llesta: el C# envia `inicio` |
| `{"tipo":"seleccionarVuelo","id":17}` / `{"tipo":"deseleccionar"}` | Comença / deixa d'enviar `infoVuelo` |
| `{"tipo":"seleccionarAeropuerto","iata":"BCN"}` | Comença a enviar `infoAeropuerto` |
| `{"tipo":"escala","valor":60}` | Segons simulats per segon real (1, 10, 60, 300, 1000...) |
| `{"tipo":"pausa","valor":true}` | Pausa o reprèn |
| `{"tipo":"horaReal"}` | Torna el rellotge simulat a l'hora UTC real |
| `{"tipo":"densidad","valor":800}` | Nombre aproximat de vols simultanis (mode simulat) |
| `{"tipo":"modo","valor":"simulado"}` | `simulado`, `directo` (OpenSky) o `proyecto` (plans de vol propis sobre Barcelona) |
| `{"tipo":"cargarPlanes"}` | El C# obre un diàleg per triar un fitxer .txt de plans de vol |
| `{"tipo":"resolverConflicto","idA":17,"idB":42}` / `{"tipo":"resolverTodos"}` | Resolució automàtica (canvi de nivell o de velocitat) |
| `{"tipo":"exportarInforme"}` | Desa un informe de conflictes i instruccions amb el contacte de les companyies |

### Afegits opcionals al protocol

- `estado` en mode `proyecto` porta també `previstos:[[idA,idB],...]`: parelles que tindran conflicte més endavant (calculat amb `ConflictoFuturo` de FlightLib).
- `infoVuelo` en mode `directo` afegeix `paisOrigen` i `icao24`; `matricula` és l'ICAO24 en majúscules.
- `planesProyecto.caja` és tot l'espai aeri 0..799 (1 unitat = 1 NM, (400,400) = Barcelona-El Prat) i `distanciaSeguridadNM` = 25.
- Els vols en directe tenen ids a partir de 1.000.000 i `estado` s'envia a 4 Hz en aquest mode (uns 20 Hz en els altres). Entrar en mode directe posa l'escala a x1 i el rellotge a l'hora real.

## Paràmetres de prova del visor (només en un navegador normal, mode demo)

`index.html?demo=1` activa un motor simulat en JavaScript (`js/demo.js`) per provar la pàgina sense el C#.
Altres paràmetres: `sel=<id>`, `panel=aeroport&apt=BCN`, `mode=proyecto`, `hora=<ISO>`, `cam=lat,lon,h`, `intro=0`,
`escala=`, `n=`, `capes=1`, `ajuda=1`, `buscar=<text>`, `capa=<nom>`, `fixa=1`.

## Versió 2 de la vista avançada (novetats)

| Novetat | On és |
|---|---|
| Imatges de satèl·lit d'alta resolució (Esri World Imagery, fins a zoom 18 ≈ 0,6 m/píxel) carregades per tessel·les segons on mira la càmera, a sobre d'una esfera base de 384×256 segments | `web/js/teselas.js`, `web/js/globo.js`, `web/js/shaders.js` |
| Càmera estil Google Earth: botó dret (o Ctrl + arrossegar) per girar i inclinar, zoom cap al cursor, s'inclina sola en apropar-se, fins a ~250 m del terra. Tecla `N` = orientar al nord | `web/js/camara.js` |
| Profunditat logarítmica en metres (es pot veure el planeta sencer i un avió a 30 m sense errors de profunditat) i escala d'altituds dinàmica: exagerada de lluny (×7,5) i real de prop | `web/js/main.js`, `web/js/geo.js` (`VIS`, `actualitzaEscalaVisual`) |
| 100 monuments low-poly de 50 ciutats a la seva posició real, amb etiqueta, clic i cerca (`MON`) | `web/js/monuments.js`, `web/js/monuments_geo.js` (format de les peces), `web/js/monuments/dades_*.js` |
| Pilotar qualsevol avió amb el teclat (física arcade, vol recte i anivellat sense tecles, vista de persecució o de cabina, HUD i avisos de conflicte i trànsit) | `web/js/pilotatge.js` i, al C#, `IVueloPilotable` (`Motor/Base.cs`) |
| Models detallats (GLB d'~1 MB) dels 10 avions més comuns, per als avions propers i l'avió pilotat | `web/js/modelos.js`, `web/modelos/*.glb`, generador a `Herramientas/modelos/` |
| Menys avions i més petits quan la càmera s'allunya (sempre es veuen els seleccionats i els que estan en conflicte) | `web/js/aviones.js` |
| En directe (OpenSky) el temps no es pot accelerar, aturar ni canviar d'hora (ni a la pàgina ni al C#) | `web/js/interfaz.js`, `Motor/ControladorVista.cs` (`TiempoBloqueado`) |
| Interfície nova d'estil Frutiger Aero (vidre brillant) | `web/index.html`, `web/css/estil.css`, `web/img/ui/` |

### Afegits al protocol

- `inicio` porta `tipos: [[codi, nom], ...]` i cada vol d'`estado` té un desè camp: l'índex del seu tipus a `tipos` (-1 si no se sap).
- `estado` porta `pilotado`: id de l'avió que pilota l'usuari (-1 si cap).
- JS -> C# `{"tipo":"pilotar","id":17,"lat":41.3,"lon":2.1,"alt":35000,"rumbo":120.5,"vel":450,"vv":0}` unes 10 vegades per segon mentre es pilota. El primer cop el C# posa el rellotge a x1 (sense pausa) i ignora `escala`, `pausa`, `horaReal` i `densidad` fins que s'acaba.
- JS -> C# `{"tipo":"dejarPilotar"}`: l'avió torna a la simulació. Un vol simulat continua en "vol lliure" (pilot automàtic cap al seu destí, amb descens i aterratge); un vol en directe torna a la seva posició real; un pla del projecte continua cap al seu punt final des d'on l'ha deixat l'usuari.
- C# -> JS `{"tipo":"finPilotaje","motivo":"..."}` si l'avió pilotat ja no existeix (p. ex. s'ha reiniciat la simulació).

### Paràmetres de prova nous (navegador, mode demo)

`mode=directo` (trànsit simulat com si fos en directe), `sel=-1` (primer avió en creuer), `pilot=1` (amb `sel`, comença a pilotar-lo), `mon=<nom>` (vola cap a un monument).

### Eines de desenvolupament (no formen part de l'aplicació)

- `Herramientas/monuments/previsualitzar.html`: mostra un monument sobre la imatge de satèl·lit real per comprovar-ne la posició, l'orientació i la mida (`?fitxer=dades_1&ciutat=París&m=0&vista=dalt`, `?validar=1`).
- `Herramientas/modelos/`: generador dels models GLB dels avions (vegeu el seu `LLEGEIX.md`).
Cal servir la carpeta `VistaAvancada/` amb un servidor local qualsevol.

Imatges de satèl·lit: © Esri, Maxar, Earthstar Geographics (ús no comercial amb atribució, que surt a la cantonada de la pantalla).
