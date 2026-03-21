//
// sfx creation routines
//

export default class SoundFactory {
    _ctx = new AudioContext();
    _loopSrc = null;
    
    async initBuffers() {
        this._nudgeBuf = await this._getBuf("Audio/nudge.wav");
        this._insertBuf = await this._getBuf("Audio/insert.wav");
        this._rotateBuf = await this._getBuf("Audio/rotate.try.wav");
        this._twistBuf = await this._getBuf("Audio/twist.wav");
        this._errorBuf = await this._getBuf("Audio/error.wav");
    }
    
    _getBuf(localPath) {
        return fetch(localPath)
            .then(r => {
                return r.arrayBuffer(); })
            .then(d => { 
                return this._ctx.decodeAudioData(d); });
    }

    _startBuf(b, loop = false) {
        const s = this._ctx.createBufferSource();
        
        s.buffer = b;
        s.loop = loop;
        s.connect(this._ctx.destination);
        s.start();
        
        return s;
    }
    
    stopAll() {
        this.stopRotationLoop();
    }
    
    playNudge() {
        this._startBuf(this._nudgeBuf);
    }
    
    playInsert() {
        this._startBuf(this._insertBuf);
    }
    
    playError() {
        this._startBuf(this._errorBuf);
    }
    
    stopRotationLoop() {
        if (this._loopSrc) {
            this._loopSrc.playbackRate.linearRampToValueAtTime(0, this._ctx.currentTime + 0.05);
            this._loopSrc.stop(this._ctx.currentTime + 0.05);
            this._loopSrc = null;
        }
    }
    
    startRotationLoop() {
        if (this._loopSrc) {
            this._loopSrc.stop();
        }
        
        const s = this._ctx.createBufferSource();
        const g = this._ctx.createGain();
        const startTime = this._ctx.currentTime;
        const timeToFullSpeed = startTime + 1.0; // FIXME: match when velocity is 100%

        s.connect(g);
        g.connect(this._ctx.destination);

        s.buffer = this._rotateBuf;
        s.loop = true;
        
        s.playbackRate.setValueAtTime(0.001, startTime); // 0.001 per ChatGPT
        s.playbackRate.linearRampToValueAtTime(1.0, timeToFullSpeed);

        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(1, startTime + 0.3);
        
        s.start(this._ctx.currentTime);

        this._loopSrc = s;
    }
}