//
// sfx creation routines
//

export default class SoundFactory {
    _ctx = new AudioContext();
    _loopSrc = null;
    _isPrimed = false;
    
    async initBuffers() {
        this._nudgeBuf = await this._getBuf("Audio/nudge.wav");
        this._insertBuf = await this._getBuf("Audio/insert.wav");
        this._rotateBuf = await this._getBuf("Audio/rotate.try.wav");
        this._twistBuf = await this._getBuf("Audio/twist.wav");
        this._errorBuf = await this._getBuf("Audio/error.wav");
        this._unlockBuf = await this._getBuf("Audio/unlock.mp3");
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
        s.start(this._ctx.currentTime);
        
        return s;
    }

    primeAudio() {
        if (!this._isPrimed) {
            this._ctx.resume();

            const s = this._ctx.createBufferSource();
            
            s.buffer = this._ctx.createBuffer(1, 1, this._ctx.sampleRate);
            s.connect(this._ctx.destination);
            s.start();

            this._isPrimed = true;
        }
    }
    
    stopAll() {
        if (this._loopSrc) {
            this._loopSrc.stop();
            this._loopSrc = null;
        }

        this._ctx.close();
        this._ctx = new AudioContext();
    }
    
    playNudge() {
        this._startBuf(this._nudgeBuf);
    }

    playUnlock() {
        this._startBuf(this._unlockBuf);
    }
    
    playInsert() {
        this._startBuf(this._insertBuf);
    }
    
    playError() {
        this._startBuf(this._errorBuf);
    }

    startRotationLoop() {
        this._loopSrc = this._startBuf(this._rotateBuf, true);
    }
    
    stopRotationLoopWithRamp() {
        if (this._loopSrc) {
            this._loopSrc.playbackRate.linearRampToValueAtTime(0, this._ctx.currentTime + 0.05);
            this._loopSrc.stop(this._ctx.currentTime + 0.05);
            this._loopSrc = null;
        }
    }
    
    startRotationLoopWithRamp() {
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