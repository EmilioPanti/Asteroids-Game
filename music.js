"use strict";

//maxStreams = suoni concorrenti max dello stesso suono
function Music(srcLow, srcHigh) {
    this.soundLow = new Audio(srcLow);
    this.soundHigh = new Audio(srcHigh);
    this.low = true;
    this.tempo = 1.0; //second per beat
    this.beatTime = 0; //frame rimasti al prossimo beat
}


//attiva il suono
Music.prototype.play = function() {
    if (MUSIC_ON) {
        if (this.low) this.soundLow.play();
        else this.soundHigh.play();
        this.low = !this.low;
    }
}


//metodo per aggiornare il beatTime della musica (chiamato ad ogni frame di gioco)
Music.prototype.tick = function() {
    if (this.beatTime == 0) {
        this.play();
        this.beatTime = Math.ceil(this.tempo * FPS);
    } else {
        this.beatTime--;
    }
}


//metodo per modificare il ratio della velocità della musica
Music.prototype.setMusicRatio = function(ratio) {
    //0.75 è per limitare il tempo fino ad un massimo di 4 beat al secondo
    this.tempo = 1.0 - 0.75 * (1.0 - ratio);
}