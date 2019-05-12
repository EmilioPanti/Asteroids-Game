"use strict";

var typeBonus = {
    LIFE: 1,
    BLINK: 2,
    TRIPLE_LASER: 3,
};

function Bonus(x, y, r, level) {
    //moltiplicatore di livello
    let lvlMult = 1 + 0.1 * level;

    //pos iniziale 
    this.x = x;
    this.y = y;

    //velocità (random)
    this.xv = Math.random() * BONUS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1);
    this.yv = Math.random() * BONUS_SPEED * lvlMult / FPS * (Math.random() < 0.5 ? 1 : -1);

    //raggio
    this.r = r;

    //assegno casualmente il tipo di bonus ed il colore relativo
    var random = Math.ceil(Math.random() * 3);
    var typeb, color;
    switch(random) {
        case 1: 
            typeb = typeBonus.LIFE;
            color = "rgba(0, 255, 0,"; //verde
            break;
        case 2:
            typeb = typeBonus.BLINK;
            color = "rgba(0, 0, 255,"; //blue
            break;
        case 3:
            typeb = typeBonus.TRIPLE_LASER;
            color = "rgba(255, 0, 0,"; //red
            break;
    }
    this.typeb = typeb;
    this.color = color;

    //trasparenza colore
    this.alpha = 1.0;
}


//metodo che disegna il bonus
Bonus.prototype.drawBonus = function(/** @type {HTMLCanvasElement} */ canv, /** @type {CanvasRenderingContext2D} */ ctx) {
    //controllo parametri
    if (!(canv instanceof HTMLCanvasElement)) throw Error('invalid argument: canv must be a HTMLCanvasElement');
    if (!(ctx instanceof CanvasRenderingContext2D)) throw Error('invalid argument: ctx must be a CanvasRenderingContext2D');

    
    if (this.alpha >= 0) {
        // Creo il gradiente circolare e ne specifico i colori
        var radgrad = ctx.createRadialGradient(this.x, this.y, Math.ceil(this.r / 2), this.x, this.y, this.r);
        radgrad.addColorStop(0, this.color + this.alpha + ")");
        radgrad.addColorStop(1, "rgba(255, 255, 255," + this.alpha + ")");

        // disegno il gradiente circolare
        ctx.fillStyle = radgrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.fill();

        //aggiorno la trasparenza
        this.alpha -= (1.0 / BONUS_DUR / FPS);
    }
    
}


//metodo che muove il bonus
Bonus.prototype.moveBonus = function(/** @type {HTMLCanvasElement} */ canv) {
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