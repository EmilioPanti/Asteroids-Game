"use strict";

function Asteroid(x, y, r, level) {
    //moltiplicatore di livello
    let lvlMult = 1 + 0.1 * level;

    //pos iniziale 
    this.x = x;
    this.y = y;

    //velocità (random)
    this.xv = Math.random() * ASTEROIDS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1);
    this.yv = Math.random() * ASTEROIDS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1);

    //raggio
    this.r = r;

    //angolo (valore random trasformato in radianti)
    this.a = Math.random() * Math.PI * 2;

    //numero di vertici dell'asteroide (random anche questi)
    this.vert = Math.floor(Math.random() * (ASTEROIDS_VERT +1) + ASTEROIDS_VERT / 2);

    //array di offset per modificare la locazione dei vertici
    //in questo modo i poligoni degli asteroidi sono irregolari
    this.offs = [];
    for (var i = 0; i < this.vert; i++) {
        this.offs.push(Math.random() * ASTEROIDS_JAG * 2 + 1 - ASTEROIDS_JAG);
    }
}


//metodo che disegna l' asteroide
Asteroid.prototype.drawAsteroid = function(/** @type {HTMLCanvasElement} */ canv, /** @type {CanvasRenderingContext2D} */ ctx) {
    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');
    if (!(ctx instanceof CanvasRenderingContext2D)) throw Error('invalid argument: ctx must be a CanvasRenderingContext2D');

    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = SHIP_SIZE / 20;

    //proprietà asteroide
    let a = this.a;
    let r = this.r;
    let x = this.x;
    let y = this.y;
    let offs = this.offs;
    let vert = this.vert;

    //draw path
    ctx.beginPath();
    ctx.moveTo(
        x + r * offs[0] * Math.cos(a),
        y + r * offs[0] * Math.sin(a)
    );

    //disegno dell poligono (che rappresenta l'asteroide)
    for (var j = 1; j < vert; j++) {
        ctx.lineTo(
            x + r * offs[j] * Math.cos(a + (j * Math.PI * 2 / vert)),
            y + r * offs[j] * Math.sin(a + (j * Math.PI * 2 / vert))
        );
    }
    ctx.closePath();
    ctx.stroke();

    //mostrare il cerchio di collisione dell' asteroide
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.stroke();
    }
}


//metodo che muove la nave
Asteroid.prototype.moveAsteroid = function(/** @type {HTMLCanvasElement} */ canv) {
    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');

    //muovo l' asteroide 
    this.x += this.xv;
    this.y += this.yv;

    //gestione dei fuori schermi
    if (this.x < 0 - this.r) {
        this.x = canv.width + this.r;
    } else if (this.x > canv.width + this.r) {
        this.x = 0 - this.r
    }
    if (this.y < 0 - this.r) {
        this.y = canv.height + this.r;
    } else if (this.y > canv.height + this.r) {
        this.y = 0 - this.r
    }
}
