export default class PokemonData {
    malieRoot = "https://cdn.malie.io/file/malie-io/tcgl/export/"
    malieIndex = "index.json";

    loadFromJSON() {
        fetch(this.malieRoot + this.malieIndex)
            .then(r => r.json().then(
                root => {
                    fetch(this.malieRoot + root["en-US"].mealt.path)
                        .then(r => r.json().then(
                            cards => {
                                cards.forEach(c => {
                                    console.log(c.images.tcgl.png.foil);
                                });
                            }
                        ));
                }))
            .catch(e => { console.log(e); });
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image(); // HTMLImageElement
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async init() {
        this.base = await this.loadImage("./Images/PokePad-Base.png");
        this.etch = await this.loadImage("./Images/PokePad-Etch.png");
        this.foil = await this.loadImage("./Images/PokePad-Foil.png");

        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = this.base.width;
        this.canvas.height = this.base.height;

        this.w = this.canvas.width;
        this.h = this.canvas.height;

        // reusable canvases
        this.shimmer = document.createElement("canvas");
        this.shimmer.width = this.w;
        this.shimmer.height = this.h;
        this.sctx = this.shimmer.getContext("2d");

        this.temp = document.createElement("canvas");
        this.temp.width = this.w * 2;
        this.temp.height = this.h * 2;
        this.tctx = this.temp.getContext("2d");
    }

    drawCard(time = 0) {
        const ctx = this.ctx;
        const sctx = this.sctx;
        const tctx = this.tctx;

        const w = this.w;
        const h = this.h;

        // clear
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(this.base, 0, 0);

        sctx.clearRect(0, 0, w, h);
        tctx.clearRect(0, 0, this.temp.width, this.temp.height);

        // =============================
        // SHIMMER GENERATION
        // =============================
        const speed = time * 0.01;

        // ---------- Layer 1 ----------
        const stripeWidth = 60;
        const gap = 100;
        const total = stripeWidth + gap;
        const offset = speed % total;

        for (let x = -this.temp.width; x < this.temp.width * 2; x += total) {
            const xpos = x + offset;

            const hue = (x * 6) % 360;

            const grad = tctx.createLinearGradient(xpos, 0, xpos + stripeWidth, 0);
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.5, `hsla(${hue}, 70%, 75%, 0.4)`);
            grad.addColorStop(1, "rgba(255,255,255,0)");

            tctx.fillStyle = grad;
            tctx.fillRect(xpos, 0, stripeWidth, this.temp.height);
        }

        // ---------- Layer 2 ----------
        const stripeWidth2 = 80;
        const gap2 = 100;
        const total2 = stripeWidth2 + gap2;
        const offset2 = (-speed * 0.7) % total2;

        for (let x = -this.temp.width; x < this.temp.width * 2; x += total2) {
            const xpos = x + offset2;

            const hue = (x * 4) % 360;

            const grad = tctx.createLinearGradient(xpos, 0, xpos + stripeWidth2, 0);
            grad.addColorStop(0, "rgba(255,255,255,0)");
            grad.addColorStop(0.5, `hsla(${hue}, 60%, 70%, 0.2)`);
            grad.addColorStop(1, "rgba(255,255,255,0)");

            tctx.fillStyle = grad;
            tctx.fillRect(xpos, 0, stripeWidth2, this.temp.height);
        }

        // rotate once
        sctx.save();
        sctx.translate(w / 2, h / 2);
        sctx.rotate(Math.PI / 4);
        sctx.drawImage(this.temp, -this.temp.width / 2, -this.temp.height / 2);
        sctx.restore();

        // =============================
        // ETCH MASK
        // =============================
        sctx.globalCompositeOperation = "destination-in";
        sctx.drawImage(this.etch, 0, 0, w, h);

        // =============================
        // ETCH DETAIL
        // =============================
        sctx.globalCompositeOperation = "overlay";
        sctx.globalAlpha = 0.3;
        sctx.filter = "contrast(1.5) brightness(1.5)";
        sctx.drawImage(this.etch, 0, 0, w, h);

        sctx.filter = "none";
        sctx.globalAlpha = 1;
        sctx.globalCompositeOperation = "source-over";

        // =============================
        // FINAL COMPOSITE
        // =============================
        ctx.globalCompositeOperation = "overlay";
        ctx.drawImage(this.shimmer, 0, 0);

        ctx.globalCompositeOperation = "source-over";
    }
}