"use strict";

//gestione suoni nave
var fxExplode = new Sound("sounds/explode.m4a");
var fxLaser = new Sound("sounds/laser.m4a", Math.ceil(LASER_MAX / 2), 0.3);
var fxThrust = new Sound("sounds/thrust.m4a");


function Ship(/** @type {HTMLCanvasElement} */ canv) {
    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');

    //pos iniziale 
    this.x = canv.width / 2;
    this.y = canv.height / 2;

    //raggio
    this.r = SHIP_SIZE / 2;

    //angolo (direzione della ship)
    //pos inziale a 90°, trasformati in radianti
    this.a = 90 / 180 * Math.PI;

    //rotazione
    this.rot = 0;

    //spinta/movimento
    this.thrusting = false;
    this.thrust = {
        x: 0,
        y: 0
    }

    //frame rimasti della durata dell'esplosione della nave
    // se > 0 vuol dire quindi che sta esplodendo
    this.explodeTime = 0;

    //numero di lampeggi rimasti da fare
    this.blinkNum = Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR);
    //durata di un lampeggio (in frame)
    this.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);

    //flag per sapere se la nave può sparare o meno
    this.canShoot = true;

    //lasers sparati
    this.lasers = [];

    //true solo se il giocatore ha finito le vite
    this.dead = false;

    //frame rimasti di triplo laser
    this.tripleLaserTime = 0;
}


//metodo che disegna la nave
Ship.prototype.drawShip = function(/** @type {HTMLCanvasElement} */ canv, /** @type {CanvasRenderingContext2D} */ ctx) {
    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');
    if (!(ctx instanceof CanvasRenderingContext2D)) throw Error('invalid argument: ctx must be a CanvasRenderingContext2D');

    //variabile per sapere se la nave sta esplodendo
    var exploding = this.explodeTime > 0;

    //variabile per sapere in quale fase del lampeggio sono (mostrare/non mostrare la nave)
    var blinkOn = ship.blinkNum % 2 == 0;


    //spinta della ship (e disegno della fiamma posteriore)
    if (this.thrusting && !this.dead) {
        this.thrust.x += SHIP_THRUST * Math.cos(this.a) / FPS;
        this.thrust.y -= SHIP_THRUST * Math.sin(this.a) / FPS;

        fxThrust.play();

        //disegno della fiamma (triangolo come la ship) (se non sono in esplosione)
        if (!exploding && blinkOn) {
            ctx.fillStyle = "red";
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = SHIP_SIZE / 10;
            ctx.beginPath();
            ctx.moveTo( // posteriore sx 
                this.x - this.r * (2 / 3 * Math.cos(this.a) + 0.5 * Math.sin(this.a)),
                this.y + this.r * (2 / 3 * Math.sin(this.a) - 0.5 * Math.cos(this.a))
            );
            ctx.lineTo( // punta della fiamma
                this.x - this.r * 5 / 3 * Math.cos(this.a),
                this.y + this.r * 5 / 3 * Math.sin(this.a)
            );
            ctx.lineTo( // posteriore dx
                this.x - this.r * (2 / 3 * Math.cos(this.a) - 0.5 * Math.sin(this.a)),
                this.y + this.r * (2 / 3 * Math.sin(this.a) + 0.5 * Math.cos(this.a))
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        //applico l'attrito dello spazio
        this.thrust.x -= FRICTION * this.thrust.x / FPS;
        this.thrust.y -= FRICTION * this.thrust.y / FPS;
        fxThrust.stop(); 
    }


    //draw ship
    if (!exploding) {
        if (blinkOn && !this.dead) {
            this.drawTriangularShip(canv, ctx);
        }

        //gestione del lampeggio della nave
        if (ship.blinkNum > 0) {

            //riduco il tempo rimasto dell'attuale lampeggio
            ship.blinkTime--;

            //riduco il numero di lampeggi rimasti (se ho terminato quello attuale)
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }
    } else {
        //disegno l'esplosione
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }


    //mostrare il cerchio di collisione della nave
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    //centroide della ship
    if (SHOW_CENTRE_DOT) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x -1, this.y -1, 2, 2);
    }

    //disegno i laser sparati dalla nave
    for (var i = 0; i < this.lasers.length; i++) {
        this.lasers[i].drawLaser(canv, ctx);
    }

    //aggiorno il tempo del triplo laser time+
    if (this.tripleLaserTime > 0) {
        this.tripleLaserTime--;
    } 
}


//metodo che muove la nave
Ship.prototype.moveShip = function(/** @type {HTMLCanvasElement} */ canv) {
    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');

    //rotazione della ship
    this.a += this.rot;

    //movimento della ship
    this.x += this.thrust.x;
    this.y += this.thrust.y;

    //gestione del fuori schermo
    if (this.x < 0 - this.r) {
        this.x = canv.width + this.r;
    } else if (this.x > canv.width + this.r) {
        this.x = 0 - this.r;
    }
    if (this.y < 0 - this.r) {
        this.y = canv.height + this.r;
    } else if (this.y > canv.height + this.r) {
        this.y = 0 - this.r;
    }

    //muovo i lasers sparati dalla nave
    var toDelete = false;
    for (var i = this.lasers.length - 1; i >= 0; i--) {
        toDelete = this.lasers[i].moveLaser(canv, toDelete);

        //se il laser è esploso o ha raggiunto la distanza massima percorribile
        if (toDelete) {
            this.lasers.splice(i, 1);
        }
    }

}


//metodo che avvia la fase di esplosione della nave
Ship.prototype.explodeShip = function() {
    this.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
    fxExplode.play();
}


//metodo che spara un laser
Ship.prototype.shootLaser = function() {
    //creo un oggetto laser
    if (this.canShoot && this.lasers.length < LASER_MAX) {
        var xl = this.x + 4 / 3 * this.r * Math.cos(this.a);
        var yl = this.y - 4 / 3 * this.r * Math.sin(this.a);

        //se è attivo il triplo laser ne genero tre
        if (this.tripleLaserTime > 0) {
            if (this.lasers.length < LASER_MAX - 2) {
                this.lasers.push(new Laser(xl, yl, this.a));
                this.lasers.push(new Laser(xl, yl, this.a - 45 / 180 * Math.PI));
                this.lasers.push(new Laser(xl, yl, this.a + 45 / 180 * Math.PI));
                this.tripleLaserTime--;
            }
        } else {
            //ne genero solo uno
            this.lasers.push(new Laser(xl, yl, this.a));
        }

        //attivo il suono del laser
        fxLaser.play();
    }

    //blocco la possibilità di sparare
    this.canShoot = false;
}


//disegna il triangolo che rappresenta la navicella
Ship.prototype.drawTriangularShip = function(/** @type {HTMLCanvasElement} */ canv, /** @type {CanvasRenderingContext2D} */ ctx,
x = this.x, y = this.y, a = this.a, colour = "white") {

    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');
    if (!(ctx instanceof CanvasRenderingContext2D)) throw Error('invalid argument: ctx must be a CanvasRenderingContext2D');

    ctx.strokeStyle = colour;
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    //triangolo ship (nota: (4/3) e (2/3) aggiunti per centrare il triangolo rispetto il centroide)
    ctx.moveTo( //testa (punta) della ship
        x + 4 / 3 * this.r * Math.cos(a),
        y - 4 / 3 * this.r * Math.sin(a)
    );
    ctx.lineTo( //fino al posteriore sx
        x - this.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + this.r * (2 / 3 * Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo( //fino al posteriore dx
        x - this.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + this.r * (2 / 3 * Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    //'trattino' che identifica la testa
    ctx.moveTo( //testa (punta) della ship
        x + 4 / 3 * this.r * Math.cos(a),
        y - 4 / 3 * this.r * Math.sin(a)
    );
    ctx.lineTo(
        x + 1 / 3 * this.r * Math.cos(a),
        y - 1 / 3 * this.r * Math.sin(a)
    );
    ctx.stroke();
}