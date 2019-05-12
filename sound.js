"use strict";

//maxStreams = suoni concorrenti max dello stesso suono
function Sound(src, maxStreams = 1, vol = 1.0) {
    this.maxStreams = maxStreams
    this.streamCur = 0;
    this.streams = [];
    for (var i = 0; i < maxStreams; i++){
        this.streams.push(new Audio(src));
        this.streams[i].volume = vol;
    }
}


//attiva il suono
Sound.prototype.play = function() {
    if (SOUND_ON) {
        //la play viene chiamata ciclicamente sull' array di streams
        this.streamCur = (this.streamCur + 1) % this.maxStreams;
        this.streams[this.streamCur].play();
    }
}


//ferma il suono
Sound.prototype.stop = function() {
    this.streams[this.streamCur].pause();
    this.streams[this.streamCur].currentTime = 0;
}