"use strict";

//VARIABILI DI CONFIGURAZIONE
const FPS = 45; //frame per secondo
const FRICTION = 0.7; //attrito spazio
const GAME_LIVES = 3 //numero di vite
const SAVE_KEY_SCORE = "highscore"; //key di salvataggio per memorizzare localmente il punteggio record

const ASTEROIDS_NUM = 3; //numero di asteroidi iniziale
const ASTEROIDS_JAG = 0.3; //"irregolarità" degli asteroidi (0 = poligoni perfetti, 1 = massima irregolarità possibile)
const ASTEROIDS_SIZE = 100; //dimensione iniziale degli asteroidi in pixels
const ASTEROIDS_SPEED = 50; //velocità massima iniziale asteroidi in pixels per second
const ASTEROIDS_VERT = 10; //numero medio di vertici per asteroide

const ASTEROIDS_PTS_LGE = 2; //punti per un asteroide grande
const ASTEROIDS_PTS_MED = 5; //punti per un asteroide medio
const ASTEROIDS_PTS_SML = 10; //punti per un asteroide piccolo

const SHIP_SIZE = 30; //ship height in pixel
const SHIP_THRUST = 5; //accellerazione della spinta, pixels per second per second
const ROTATION_SPEED = 2 * Math.PI; //radianti (360°) per secondo 
const SHIP_EXPLODE_DUR = 0.3 //durata (in secondi) dell' esplosione della ship
const SHIP_INV_DUR = 3; //durata della invulnerabilità della nave (in secondi)
const SHIP_BLINK_DUR = 0.1; //durata (in secondi) di un singolo lampeggio durante l'invulnerabilità della nave

const LASER_MAX = 10; //numero massimo di laser sullo schrmo
const LASER_SPEED = 500; //velocità dei laser (in pixels al secondo)
const LASER_DIST = 0.5 //frazione di schermo massima che un laser può percorrere
const LASER_EXPLODE_DUR = 0.1 //durata (in secondi) dell' esplosione del laser
const LASER_TRIPLE_DUR = 7; //durata (in secondi) del triplo laser

const BONUS_DUR = 7; //durata in secondi del bonus
const BONUS_PTS = 100; //punti da totalizzare per far apparire un bonus
const BONUS_SPEED = 40; //velocità massima iniziale bonus in pixels per second

const SHOW_BOUNDING = false; //rendi o meno effettive le collisioni
const SHOW_CENTRE_DOT = false; //mostra o meno il centroide della ship

const TEXT_FADE_TIME = 2.5; //tempo (in secondi) di dissolvenza testo
const TEXT_SIZE = 40; //altezza in pixel del testo

const SOUND_ON = true; //attiva/disattiva i suoni del gioco
const MUSIC_ON = true; //attiva/disattiva musica di bg