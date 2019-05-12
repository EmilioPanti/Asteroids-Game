"use strict";

//recuperare canvas e contesto2D
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

//suoni e musica del gioco
var fxHit = new Sound("sounds/hit.m4a", Math.ceil(LASER_MAX / 2));
var music = new Music("sounds/music-low.m4a", "sounds/music-high.m4a");
var asteroidsLeft, asteroidsTotal; //var per gestire la velocità della musica in bg

//variabili di gioco
var ship, lives, score, scoreHigh, asteroids, level, text, textAlpha, bonus, bonusActive, scoreBonus;
newGame();

//gestore eventi
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//intervallo chiamata update(1 secondo / FPS)
setInterval(update, 1000 / FPS);


function newGame() {
    level = 0;
    lives = GAME_LIVES;
    score = 0;
    bonusActive = false;
    scoreBonus = BONUS_PTS;
    music.setMusicRatio(1.0);

    //prendo il punteggio record dalla memoria locale 
    //è una stringa di default (la trasformo in Int)
    let scoreStr = localStorage.getItem(SAVE_KEY_SCORE);
    if (scoreStr == null) {
        scoreHigh = 0;
    } else {
        scoreHigh = parseInt(scoreStr);
    }

    //creo la nave
    ship = new Ship(canv);
    //creo il livello
    newLevel();
}


function newLevel() {
    text = "LEVEL " + (level + 1);
    textAlpha = 1.0;
    //creo gli asteroidi
    createAsteroidsBelt();
}


function createAsteroidsBelt() {
    asteroids = [];
    //nota: 7 perchè 1 grande, 2 medi, 4 piccoli 
    asteroidsTotal = (ASTEROIDS_NUM + level) * 7;
    asteroidsLeft = asteroidsTotal;

    var x, y; 
    for (var i = 0; i < ASTEROIDS_NUM + level; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROIDS_SIZE * 2 + ship.r);
        //la condizione nel while è per creare gli asteroidi ad una certa distanza dalla ship

        asteroids.push(new Asteroid(x, y, Math.ceil(ASTEROIDS_SIZE /2), level));
    }
}


function destroyAsteroid(index) {
    var x = asteroids[index].x;
    var y = asteroids[index].y;
    var r = asteroids[index].r;

    //divido l'asteroide se necessario
    if (r == Math.ceil(ASTEROIDS_SIZE / 2)) { 
        //se era un asteroide grande ---> creo 2 asteroidi medi
        asteroids.push(new Asteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4), level));
        asteroids.push(new Asteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 4), level));
        score += ASTEROIDS_PTS_LGE;
    } else if (r == Math.ceil(ASTEROIDS_SIZE / 4)) { 
        //se era un medio asteroide ---> creo 2 asteroidi piccoli
        asteroids.push(new Asteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8), level));
        asteroids.push(new Asteroid(x, y, Math.ceil(ASTEROIDS_SIZE / 8), level));
        score += ASTEROIDS_PTS_MED;
    } else {
        score += ASTEROIDS_PTS_SML;
    }

    //aggiorno (eventualmente) il punteggio record
    if (score > scoreHigh) {
        scoreHigh = score;
        localStorage.setItem(SAVE_KEY_SCORE, scoreHigh);
    }

    //distruggo l'asteroide
    asteroids.splice(index, 1);
    fxHit.play();

    //calcolo il ratio degli asteroidi rimasti 
    //(è il parametro su cui si basa la velocità della musica in bg)
    asteroidsLeft--;
    music.setMusicRatio(asteroidsLeft == 0 ? 1 : asteroidsLeft / asteroidsTotal);

    //creo livello successivo se sono stati distrutti tutti gli asteroidi
    if (asteroids.length == 0) {
        level++;
        newLevel();
    }

    //creo un bonus (ogni tot di punti)
    if (score >= scoreBonus)  {
        scoreBonus += BONUS_PTS;
        //se non è presente nessun bonus
        if (!bonusActive) {
            var xb, yb;
            do {
                xb = Math.floor(Math.random() * canv.width);
                yb = Math.floor(Math.random() * canv.height);
            } while (distBetweenPoints(ship.x, ship.y, xb, yb) < ASTEROIDS_SIZE * 2 + ship.r);
            //la condizione nel while è per creare il bonus ad una certa distanza dalla ship
            bonus = new Bonus(xb, yb, SHIP_SIZE / 2, level);
            bonusActive = true;
        }
    }
}


function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}


function gameOver() {
    ship.dead = true;
    text = "GAME OVER";
    textAlpha = 1.0;
}


function keyDown(/** @type {KeyboardEvent} */ ev) {

    if (ship.dead) return;

    switch(ev.keyCode) {
        case 32: //space bar (spara laser)
            ship.shootLaser();
            break;
        case 37: //freccia sx (ruota a sx la ship)
            ship.rot = ROTATION_SPEED / FPS;
            break;
        case 38: //freccia su (spinge la ship avanti)
            ship.thrusting = true;
            break;
        case 39: //freccia dx (ruota a dx la ship)
            ship.rot = - (ROTATION_SPEED / FPS);
            break;
    }
}


function keyUp(/** @type {KeyboardEvent} */ ev) {

    if (ship.dead) return;

    switch(ev.keyCode) {
        case 32: // space bar (permette di sparare nuovamente laser)
            ship.canShoot = true;
            break;
        case 37: //freccia sx (stop ruota a sx)
            ship.rot = 0;
            break;
        case 38: //freccia su (stop spinta in avanti)
            ship.thrusting = false;
            break;
        case 39: //freccia dx (stop ruota a dx)
            ship.rot = 0;
            break;
        }
}


function update() {
    //draw space (bg)
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    //aggiorno la musica in bg (se non sono in fase di GameOver)
    if (!ship.dead) music.tick();

    //draw ship
    ship.drawShip(canv, ctx);

    //draw bonus
    if (bonusActive) {
        bonus.drawBonus(canv, ctx);
        if (bonus.alpha < 0) bonusActive = false;
    }

    //draw asteroidi
    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].drawAsteroid(canv, ctx);
    }

    //controllo se i lasers hanno colpito gli asteroidi
    var ax, ay, ar, lx, ly;
    for (var i = asteroids.length - 1; i >= 0; i--) {

        //prendo le proprietà dell'asteroide
        ax = asteroids[i].x;
        ay = asteroids[i].y;
        ar = asteroids[i].r;

        //itero su tutti i laser sparati
        for (var j = ship.lasers.length - 1; j >= 0; j--) {

            //prendo le proprietà del laser
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            //controllo eventuali collisioni tra laser ed asteroide
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                //distruggo l'asteroide ed attivo l'esplosione del laser
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                break;
            }
        }
    }


    //se la nave non è in fase di esplosione
    if (ship.explodeTime == 0) {

        //controllo se la nave ha preso il bonus
        if (bonusActive && !ship.dead) {
            if (distBetweenPoints(ship.x, ship.y, bonus.x, bonus.y) < ship.r + bonus.r) {
                //in base al bonus preso:
                switch(bonus.typeb) {
                    case typeBonus.LIFE: 
                        if (lives < GAME_LIVES) lives++;
                        break;
                    case typeBonus.BLINK:
                        //numero di lampeggi da fare
                        ship.blinkNum = Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR * 2);
                        //durata di un lampeggio (in frame)
                        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                        break;
                    case typeBonus.TRIPLE_LASER:
                        //durata del laser triplo (in frame);
                        ship.tripleLaserTime = Math.ceil(LASER_TRIPLE_DUR * FPS);
                        break;
                }
                //disattivo il bonus
                bonusActive = false;
            }
        }

        //controllo eventuali collisioni tra nave ed asteroidi
        //se non sono in fase di "lampeggio" della nave
        if (ship.blinkNum == 0 && !ship.dead) {
            for (var i = 0; i < asteroids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                    ship.explodeShip();
                    destroyAsteroid(i);
                    break; 
                    /* 
                    il break serve per smettere di iterare tra gli asteroidi (altrimenti 
                    rischio di distruggerne altri durante l'esplosione della nave)
                    */
                }
            }
        }

        //muovo la nave
        ship.moveShip(canv);

    } else {
        //riduco il tempo di esplosione rimasto
        ship.explodeTime--;

        //resetto la nave se è finita l'esplosione (aggiorno le vite)
        if (ship.explodeTime == 0) {
            lives--;
            if (lives == 0) gameOver();
            else ship = new Ship(canv);
        }
    }
    

    //muovo il bonus (se attivo)
    if (bonusActive) {
        bonus.moveBonus(canv);
    }

    //muovo gli asteroidi
    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].moveAsteroid(canv);
    }
    
    //draw text (livello)
    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255," + textAlpha + ")";
        ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
        ctx.fillText(text, canv.width / 2, canv.height * 0.75);
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    } else if (ship.dead) {
        newGame();
    }

    //draw vite rimaste
    var lifeColour
    for (var i = 0; i < lives; i++) {
        //se la nave sta esplodendo l'ultima vita è di colore rosso
        if (ship.explodeTime != 0 && i == lives -1) lifeColour = "red";
        ship.drawTriangularShip(canv, ctx, SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, 0.5 * Math.PI, lifeColour);
    }

    //draw punteggio
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = (TEXT_SIZE * 0.90) + "px dejavu sans mono";
    ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE);

    //draw il punteggio record
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = (TEXT_SIZE * 0.70) + "px dejavu sans mono";
    ctx.fillText("BEST " + scoreHigh, canv.width / 2, SHIP_SIZE);
}