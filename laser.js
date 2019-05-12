"use strict";

function Laser(x, y, a) {
    //pos iniziale 
    this.x = x;
    this.y = y;

    //velocità (dipendente dall'angolo della nave)
    this.xv = LASER_SPEED * Math.cos(a) / FPS;
    this.yv = - LASER_SPEED * Math.sin(a) / FPS;

    //distanza percorsa dal laser
    this.dist = 0;

    //frame rimasti della durata dell'esplosione del laser
    // se > 0 vuol dire quindi che sta esplodendo
    this.explodeTime = 0;
}


//metodo che disegna il laser
Laser.prototype.drawLaser = function(/** @type {HTMLCanvasElement} */ canv, /** @type {CanvasRenderingContext2D} */ ctx) {
    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');
    if (!(ctx instanceof CanvasRenderingContext2D)) throw Error('invalid argument: ctx must be a CanvasRenderingContext2D');

    if (this.explodeTime == 0) {
        //disegno il laser normalmente
        ctx.fillStyle = "salmon";
        ctx.beginPath();
        ctx.arc(this.x, this.y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
        ctx.fill();
    } else {
        //disegno l'esplosione del laser
        //cerchi disegnati in rapporto al raggio della nave (SHIP_SIZE / 2)
        ctx.fillStyle = "orangered";
        ctx.beginPath();
        ctx.arc(this.x, this.y, (SHIP_SIZE / 2) * 0.75, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "salmon";
        ctx.beginPath();
        ctx.arc(this.x, this.y, (SHIP_SIZE / 2) * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "pink";
        ctx.beginPath();
        ctx.arc(this.x, this.y, (SHIP_SIZE / 2) * 0.25, 0, Math.PI * 2, false);
        ctx.fill();
    }
}


//metodo che muove il laser
// @return: true se il laser è da eliminare, cioè se ha finito di esplodere o se 
//          ha raggiunto la massima distanza percorribile
Laser.prototype.moveLaser = function(/** @type {HTMLCanvasElement} */ canv) {
    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');

    //controllo la distanza percorsa
    if (this.dist > LASER_DIST * canv.width) {
        return true;
    }

    //gestione esplosione (se è iniziata)
    if (this.explodeTime > 0) {
        this.explodeTime--;

        //se è finita l'esplosione
        if (this.explodeTime == 0) {
            //segnalo che è da distruggere il laser
            return true;
        }
    } else {
        //muovo il laser
        this.x += this.xv;
        this.y += this.yv;

        //aggiorno la distanza percorsa
        this.dist += Math.sqrt(Math.pow(this.xv, 2) + Math.pow(this.yv, 2));
    }

    //gestione fuori schermi
    if (this.x < 0) {
        this.x = canv.width;
    } else if (this.x > canv.width) {
        this.x = 0;
    }
    if (this.y < 0) {
        this.y = canv.height;
    } else if (this.y > canv.height) {
        this.y = 0;
    }

    return false;
}