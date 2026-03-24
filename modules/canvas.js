//
// canvas draw routines
//

/** @returns {[number, number]} */
function pointOnCircle(x, y, r, a) {
    return [x + r * Math.cos(a), y + r * Math.sin(a)];
}

function drawMachinedSurfaceRadialByChatGPT(g, l) {
    const ctx = g.l.c;
    const x = l.x;
    const y = l.y;
    const inner = l.ir;
    const outer = l.or;

    let r = inner;

    while (r < outer) {
        const radius = r + (Math.random() - 0.5) * 1.2;

        const segments = 4 + Math.floor(Math.random() * 6);

        for (let s = 0; s < segments; s++) {
            const a0 = (s / segments) * Math.PI * 2;
            const a1 = a0 + (Math.random() * 0.5 + 0.2) * (Math.PI * 2 / segments);

            ctx.beginPath();
            ctx.arc(x, y, radius, a0, a1);

            // mix light + dark scratches
            if (Math.random() < 0.8) {
                ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
            } else {
                ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
            }

            ctx.lineWidth = 0.3 + Math.random() * 0.5;
            ctx.stroke();
        }

        r += 2 + Math.random() * 3;
    }
}

function drawMachinedSurfaceLinear(g, l) {
    const ctx = g.l.c;
    const clipRadius = l.r;
    const surfaceX = l.x;
    const surfaceY = l.y;
    const surfaceWidth = l.w;
    const surfaceHeight = l.h;

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, clipRadius, 0, Math.PI * 2);
    ctx.clip();

    for (let i = surfaceX; i < surfaceWidth; i += 5) {
        ctx.beginPath();
        ctx.moveTo(i + Math.sin(i * 0.02) * 5, surfaceY);
        ctx.lineTo(i + Math.sin(i * 0.02) * 5, surfaceHeight);
        ctx.strokeStyle = "rgba(0,0,0,0.02)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    for (let i = surfaceX; i < surfaceWidth; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i + Math.sin(i * 0.03) * 3, surfaceY);
        ctx.lineTo(i + Math.sin(i * 0.03) * 3, surfaceHeight);
        ctx.strokeStyle = "rgba(0,0,0,0.03)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    for (let i = surfaceX; i < surfaceWidth; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i + Math.sin(i * 0.01) * 7, surfaceY);
        ctx.lineTo(i + Math.sin(i * 0.01) * 7, surfaceHeight);
        ctx.strokeStyle = "rgba(0,0,0,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    ctx.restore();
}

function drawMachinedSurfaceRadial(g, l) {
    const ctx = g.l.c;
    const surfaceX = l.x;
    const surfaceY = l.y;
    const surfaceInnerRadius = l.ir;
    const surfaceOuterRadius = l.or;

    for (let i = surfaceInnerRadius + 1; i < surfaceOuterRadius; i += 3) {
        ctx.beginPath();
        ctx.arc(surfaceX, surfaceY, i, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(0,0,0,0.07)";
        ctx.lineWidth = 0.29;
        ctx.stroke();
    }

    for (let i = surfaceInnerRadius + 3; i < surfaceOuterRadius; i += 5) {
        ctx.beginPath();
        ctx.arc(surfaceX, surfaceY, i, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.lineWidth = 0.51;
        ctx.stroke();
    }

    for (let i = surfaceInnerRadius + 5; i < surfaceOuterRadius; i += 7) {
        ctx.beginPath();
        ctx.arc(surfaceX, surfaceY, i, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(0,0,0,0.03)";
        ctx.lineWidth = 0.67;
        ctx.stroke();
    }
}

function drawPlug(g) {
    const ctx = g.l.c;
    let plugGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, g.l.keywayRadius);
    
    plugGradient.addColorStop(0, "#f1c861");
    plugGradient.addColorStop(0.7, "#c9982f");
    plugGradient.addColorStop(1, "#7a5c1a");

    ctx.beginPath();
    ctx.arc(0, 0, g.l.plugRadius, 0, Math.PI * 2);
    ctx.fillStyle = g.l.colorInfo.Metal.TumblerStop1;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = g.l.colorInfo.Metal.TumblerStop3;
    ctx.stroke();

    // scratches

    const surfaceInfo = {
        x: - (g.l.x),
        y: - (g.l.y),
        w: g.l.plugRadius * 2,
        h: g.l.plugRadius * 2,
        r: g.l.plugRadius };

    ctx.save();
    ctx.rotate(2 * Math.PI / 16);
    drawMachinedSurfaceLinear(g, surfaceInfo);
    ctx.restore();

    // outline of a key hole
    
    ctx.save();
    ctx.translate(-5, -20); // FIXME
    //c.c.rotate(Math.PI); // pins up or down
    ctx.scale(0.5, 0.5)
    drawKeyway(g);
    ctx.restore();
}

function drawTextArc(ctx, text, centerX, centerY, radius, startAngle) {
    ctx.save();
    ctx.translate(centerX, centerY);

    // total width of text
    let totalWidth = ctx.measureText(text).width;

    // convert width to angular width
    let anglePerPixel = 1 / radius;
    let totalAngle = totalWidth * anglePerPixel;

    // start so text is centered
    let angle = startAngle - totalAngle / 2;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charAngle = charWidth * anglePerPixel;

        ctx.save();

        // rotate to character position
        ctx.rotate(angle + charAngle / 2);

        // move out to radius
        ctx.translate(0, -radius);

        // draw character centered
        ctx.strokeText(char, -charWidth / 2, 0);

        ctx.restore();

        angle += charAngle;
    }

    ctx.restore();
}

function drawCylinder(g) {
    const ctx = g.l.c;
    
    ctx.save();
    ctx.translate(g.l.x, g.l.y);

    if (g.s.allPinsInserted) {
        ctx.save();
        ctx.rotate(g.s.tumblerAngle);
    }
    
    // rim and background

    ctx.beginPath();
    ctx.arc(0, 0, g.l.cylinderRadius, 0, Math.PI * 2);
    ctx.fillStyle = g.l.colorInfo.Metal.TumblerStop1
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = g.l.colorInfo.Metal.TumblerStop3,
    ctx.stroke();

    // machining

    const surfaceInfo = {
        x: - (g.l.x),
        y: - (g.l.y),
        w: g.l.cylinderRadius * 2,
        h: g.l.cylinderRadius * 2,
        r: g.l.cylinderRadius };

    drawMachinedSurfaceLinear(g, surfaceInfo);

    // logo

    const logoW = 75;
    const logoH = 25;
    const logoX = - (logoW / 2);
    const logoY = - (logoH / 2) - 50;

    ctx.save();
    ctx.translate(logoX, logoY);
    ctx.font = "bold 24px Gotham";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.strokeText("Kobin", logoW / 2, logoH - 5);
    ctx.restore();

    ctx.save();
    ctx.translate(1, 15);
    ctx.rotate(g.s.plugAngle);
    drawPlug(g);
    ctx.restore();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.30)";
    ctx.arc(1, 15, g.l.plugRadius - 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,0,0.30)";
    ctx.arc(1, 15, g.l.plugRadius + 2, 0, 2 * Math.PI);
    ctx.stroke();

    if (g.s.allPinsInserted) {
        ctx.restore();
    }

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.30)";
    ctx.arc(0, 0, g.l.cylinderRadius - 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.30)";
    ctx.arc(0, 0, g.l.cylinderRadius + 2, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
}

function drawTickMarks(c, l) {
    c.c.save();

    c.c.rotate(l.ra);
    
    for (let i = 0; i < l.tc; i++) {
        const tickAngle = (i / l.tc) * 2 * Math.PI;

        c.c.save();
        c.c.rotate(tickAngle);
        c.c.beginPath();
        c.c.moveTo(0, l.ir);
        c.c.lineTo(0, l.or);
        c.c.strokeStyle = "#6e5418";
        c.c.lineWidth = 1;
        c.c.stroke();
        c.c.restore();
    }

    c.c.restore();
}

function drawKeyway(g) {
    const ctx = g.l.c;
    
    ctx.beginPath();

    ctx.moveTo(0, 0);
    ctx.lineTo(15, 0);
    ctx.lineTo(15, 50);
    ctx.lineTo(25, 60);
    ctx.lineTo(25, 70);
    ctx.lineTo(15, 75);
    ctx.lineTo(15, 85);
    ctx.lineTo(25, 85);
    ctx.lineTo(25, 110);
    ctx.lineTo(0, 110);
    ctx.lineTo(0, 65);
    ctx.lineTo(5, 65);
    ctx.lineTo(5, 55);
    ctx.lineTo(0, 50);
    ctx.lineTo(0, 0);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();

    ctx.fillStyle = "#1a1a1a";
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#333";
    ctx.stroke();
}

/**
 * Draws the ring with cuts for each pin
 * 
 * @param {Context} g 
 */
function drawTumblerShape(g, offset) {
    const ctx = g.l.c;
    const tumblerRadius = g.l.tumblerRadius + offset;
    let curAngle = 0;
    
    ctx.beginPath();

    ctx.moveTo(tumblerRadius, 0);

    g.s.pinStates.forEach(p => {
        const startAngle = p.ca + offset * 0.01;
        const endAngle = startAngle + p.w - offset * 0.01;
        const cutDepth = tumblerRadius - p.r;
        
        ctx.arc(0, 0, tumblerRadius, curAngle, startAngle);
        ctx.lineTo(...pointOnCircle(0, 0, cutDepth, startAngle));
        ctx.arc(0, 0, cutDepth, startAngle, endAngle);
        ctx.lineTo(...pointOnCircle(0, 0, tumblerRadius, endAngle));
        
        curAngle = endAngle;
    });
    
    ctx.arc(0, 0, tumblerRadius, curAngle, 2 * Math.PI);
    ctx.closePath();
}

/**
 * Rotating ring that has cuts for each pin
 * 
 * @param {Context} g 
 */
function drawTumbler(g) {
    const ctx = g.l.c;
    const x = g.l.x;
    const y = g.l.y;
    const tumblerRadius = g.l.tumblerRadius;   // outer rotating part with cuts
    const cylinderRadius = g.l.cylinderRadius; // inner part that has logo and key

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(g.s.tumblerAngle);

    drawTumblerShape(g, 0);
    
    // main color
    ctx.fillStyle = g.l.colorInfo.Metal.TumblerStop1;
    ctx.fill();

    const surfaceInfo = {
        x: x - g.l.x,
        y: y - g.l.y,
        ir: cylinderRadius,
        or: tumblerRadius };

    // radial shadow
    const shadowGr = ctx.createRadialGradient(0, 0, cylinderRadius, 0, 0, tumblerRadius);

    shadowGr.addColorStop(0.0, "rgba(0, 0, 0, 0.00");
    shadowGr.addColorStop(0.1, "rgba(0, 0, 0, 0.05");
    shadowGr.addColorStop(0.8, "rgba(0, 0, 0, 0.05");
    shadowGr.addColorStop(1.0, "rgba(0, 0, 0, 0.10");

    ctx.fillStyle = shadowGr;
    ctx.fill();

    ctx.strokeStyle = "rgba(179,179,179,1.0)";
    ctx.lineWidth = 2;
    ctx.stroke();

    drawTumblerShape(g, 2);

    ctx.strokeStyle = "rgba(20,20,20,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    drawTumblerShape(g, 2);

    ctx.strokeStyle = "rgba(255,255,255,.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // machining 
    drawMachinedSurfaceRadial(g, surfaceInfo);

    ctx.restore();
}

function drawPins(g) {
    g.s.pinStates.forEach(p => {
        p.a += g.s.pinDeltaAngle;

        drawPin(g, p);
    });
}

/**
 * Draws Pin
 * 
 * @param {Context} g 
 */
function drawPin(g, pin, offset = 0) {
    const ctx = g.l.c;
    const pinWedge = calculatePinWedge(g, pin, 0);
    
    drawPinShape(g, pinWedge);

    if (pin.m) {
        ctx.fillStyle = "#a13b2f";
    }
    else {
        ctx.fillStyle = g.l.colorInfo.Metal.PinStop1;
    }

    ctx.fill();
    
    ctx.strokeStyle = "rgba(179,179,179,1.0)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const pinWedge1 = calculatePinWedge(g, pin, 2);
    drawPinShape(g, pinWedge1);

    ctx.strokeStyle = "rgba(20,20,20,0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const pinWedge2 = calculatePinWedge(g, pin, 2);
    drawPinShape(g, pinWedge2);

    ctx.strokeStyle = "rgba(255,255,255,.2)";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (pin == g.s.activePin && !pin.i) {
        const localCtx = { 
            sa: pinWedge.sa,
            ea: pinWedge.ea,
            r: -1 + pinWedge.ir + (pinWedge.or - pinWedge.ir) / 2,
            c: "#6a4c1a"};

        drawRadialArrow(g, localCtx);
    }
}

function calculatePinWedge(g, pin, offset) {
    const pinWedge = {};
    let keyPinInnerRadius = g.l.tumblerRadius + g.l.tumblerSpacing - offset;
    let keyPinOuterRadius = keyPinInnerRadius + pin.r - 6 + offset;

    if (pin.i) {
        keyPinInnerRadius = g.l.tumblerRadius - pin.r + 7;
        keyPinOuterRadius = g.l.tumblerRadius + 1;

        pin.a = g.s.tumblerAngle + pin.ca;
    }

    let startAngle = pin.a - offset * 0.005;
    let endAngle = startAngle + pin.w + offset * 0.005;

    // adjust for padding

    const paddingAngle = 1 * Math.PI / 180; // one degree
    
    if (pin.i) {
        startAngle += 4 * paddingAngle;
        endAngle -= 3 * paddingAngle;
    }
    else {
        startAngle += 5 * paddingAngle;
        endAngle -= 5 * paddingAngle;
    }

    pinWedge.sa = startAngle;
    pinWedge.ea = endAngle;
    pinWedge.ir = keyPinInnerRadius;
    pinWedge.or = keyPinOuterRadius;

    return pinWedge;
}

function drawPinShape(g, pinWedge) {
    const ctx = g.l.c;
    
    ctx.beginPath();
    ctx.arc(g.l.x, g.l.y, pinWedge.or, pinWedge.sa, pinWedge.ea, false);
    ctx.arc(g.l.x, g.l.y, pinWedge.ir, pinWedge.ea, pinWedge.sa, true);
    ctx.closePath();
}

function drawRadialArrow(g, l) {
    const ctx = g.l.c;
    const arrowStart = l.sa + 0.08;
    const arrowEnd = l.ea - 0.08;
    const mr = l.r;
    const ir = mr - 5;
    const or = mr + 5;
    const [six, siy] = [...pointOnCircle(g.l.x, g.l.y, ir, arrowStart)];
    const [sox, soy] = [...pointOnCircle(g.l.x, g.l.y, or, arrowStart)];
    const [scx, scy] = [...pointOnCircle(g.l.x, g.l.y, mr, arrowStart - 0.05)];
    const [eix, eiy] = [...pointOnCircle(g.l.x, g.l.y, ir, arrowEnd)];
    const [eox, eoy] = [...pointOnCircle(g.l.x, g.l.y, or, arrowEnd)];
    const [ecx, ecy] = [...pointOnCircle(g.l.x, g.l.y, mr, arrowEnd + 0.05)];

    ctx.lineWidth = 2;
    ctx.strokeStyle = l.c;
    ctx.fillStyle = l.c;
    
    ctx.beginPath();
    ctx.arc(g.l.x, g.l.y, mr, arrowStart, arrowEnd);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(six, siy);
    ctx.lineTo(sox, soy);
    ctx.lineTo(scx, scy);
    ctx.lineTo(six, siy);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(eix, eiy);
    ctx.lineTo(eox, eoy);
    ctx.lineTo(ecx, ecy);
    ctx.lineTo(eix, eiy);
    ctx.fill();
}

/**
 * Draws Wood Paneling
 * 
 * @param {Context} c 
 */
function drawBackground(c) {
    const ctx = c.l.c;
    const width = c.l.w;
    const height = c.l.h;
    let gr = ctx.createLinearGradient(0, 0, 0, height);
    
    gr.addColorStop(0, c.l.colorInfo.LightBrown);
    gr.addColorStop(0.5, c.l.colorInfo.MediumBrown);
    gr.addColorStop(1, c.l.colorInfo.DarkBrown);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, width, height);

    // woodgrain

    for (let i = 0; i < width; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i + Math.sin(i * 0.02) * 6, 0);
        ctx.lineTo(i + Math.sin(i * 0.02) * 6, height);
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    for (let i = 0; i < width; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i + Math.sin(i * 0.03) * 3, 0);
        ctx.lineTo(i + Math.sin(i * 0.03) * 3, height);
        ctx.strokeStyle = "rgba(0,0,0,0.10)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (let i = 0; i < width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i + Math.sin(i * 0.01) * 10, 0);
        ctx.lineTo(i + Math.sin(i * 0.01) * 10, height);
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawTitlePanel(c) {
    const ctx = c.l.c;
    const titleText = "Spinner Game";
    const textX = c.l.tpx;
    const textY = c.l.tpy;
    
    ctx.save();
    
    ctx.font = "58px Filibuster NF";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // burned text
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 5;
    ctx.fillStyle = "rgba(0,0,0,0.50)";
    ctx.fillText(titleText, textX, textY);

    // outline
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.strokeText(titleText, textX, textY);

    ctx.restore();
}

function drawText(g, l) {
    const ctx = g.l.c;
    const text = l.t;
    const x = l.x;
    const y = l.y;

    ctx.textBaseline = "top";
    ctx.font =  "16pt Cormorant Garamond";

    // burned text
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 2;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillText(text, x, y);

    // outline
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.strokeText(text, x, y);
}

function drawStatusBox(g) {
    const ctx = g.l.c;
    const sbLeft = 10;
    const sbTop = 90;
    const sbWidth = g.l.w - 20;
    const sbHeight = 80;
    const drawInset = false;
    
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(sbLeft, sbTop, sbWidth, sbHeight);
    
    ctx.save();
    ctx.translate(sbLeft, sbTop);
    
    const line1 = "To move the pin around the tumbler";
    const line2 = "use the [Left] and [Right] keys. Press";
    const line3 = "[Up] to insert the pin into the cut."

    drawText(g, { t:line1, x:8, y:5 });
    drawText(g, { t:line2, x:8, y:30 });
    drawText(g, { t:line3, x:8, y:55 });
    
    ctx.strokeStyle = drawInset ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, 0);            
    ctx.lineTo(sbWidth, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0); 
    ctx.lineTo(0, sbHeight);
    ctx.stroke();

    ctx.strokeStyle = drawInset ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(sbWidth, 0);            
    ctx.lineTo(sbWidth, sbHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, sbHeight); 
    ctx.lineTo(sbWidth, sbHeight);
    ctx.stroke();

    ctx.restore();
}

function drawButtonPanel(g) {
    const ctx = g.l.c;
    const panelLeft = g.l.bpx;
    const panelTop = g.l.bpy;
    const panelWidth = g.l.bpw;
    const panelHeight = g.l.bph;
    const numButtons = g.l.buttonInfo.length;
    const buttonMargin = 10;
    const ellipsisButtonWidth = 60;
    const buttonWidth = (g.l.bpw - 2 * buttonMargin - 60) / (numButtons - 1);
    let buttonLeft = 0

    g.l.bw = buttonWidth; // FIXME

    ctx.save();
    ctx.translate(panelLeft, panelTop);

    g.l.buttonInfo.forEach(b => {
        b.x = buttonLeft + buttonMargin;
        b.y = 0;
        b.w = b.text == "..." ? ellipsisButtonWidth : buttonWidth;
        b.h = g.l.bh;

        const gr = ctx.createLinearGradient(0, 0, 0, b.h);

        if (b.s == "pressed") {
            gr.addColorStop(1, "#f2d27a");
            gr.addColorStop(0.6, "#d6a93a");
            gr.addColorStop(0, "#a37a24");
        }
        else {
            gr.addColorStop(0, "#a37a24");
            gr.addColorStop(0.4, "#c99a2e");
            gr.addColorStop(1, "#f2d27a");
        }
        

        ctx.fillStyle = gr;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        if (b.s == "pressed") {
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + 0.5);
            ctx.lineTo(b.x + b.w, b.y + 0.5);
            ctx.strokeStyle = "rgba(0,0,0,0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.h - 0.5);
            ctx.lineTo(b.x + b.w, b.y + b.h - 0.5);
            ctx.strokeStyle = "rgba(255,255,255,0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        else {
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + 0.5);
            ctx.lineTo(b.x + b.w, b.y + 0.5);
            ctx.strokeStyle = "rgba(255,255,255,0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.h - 0.5);
            ctx.lineTo(b.x + b.w, b.y + b.h - 0.5);
            ctx.strokeStyle = "rgba(0,0,0,0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(b.x, b.y);

        if (b.text == "...") {
            drawEllipsis(g, { x: b.x, y: b.s == "pressed" ? b.y + 1 : b.y, w: b.w, h: b.h });
        }
        else {
            drawFancyText(g, { t: b.text, x: b.x, y: b.s == "pressed" ? b.y + 1 : b.y, w: b.w, h: b.h });
        }

        ctx.restore();
        
        buttonLeft += b.w + 10;
    });
    
    ctx.restore();
}

function drawEllipsis(g, l) {
    const ctx = g.l.c;
    
    ctx.font = "50px Filibuster NF";
    const ellipsisWidth = ctx.measureText("...").width;
    const ellipsisX = (l.w - ellipsisWidth) / 2;
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText("...", ellipsisX, l.y);
}

function drawFancyText(g, l) {
    const ctx = g.l.c;
    const upperCase = l.t[0];
    const lowerCase = l.t.substring(1);
    const upperFont = "50px Filibuster NF";
    const lowerFont = "25px Filibuster NF";

    ctx.font = upperFont;
    const tmUpper = ctx.measureText(upperCase);

    ctx.font = lowerFont;
    const tmLower = ctx.measureText(lowerCase);

    const textWidth = tmUpper.width + tmLower.width;
    const textX = (l.w - textWidth) / 2;
    
    ctx.font = upperFont;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(upperCase, textX, l.y + (l.h / 2) + 2);
    ctx.font = lowerFont;
    ctx.textBaseline = "top";
    ctx.fillText(lowerCase, textX + tmUpper.width, l.y + (l.h / 2) - 2);
}

function drawSpots(g) {
    const ctx = g.l.c;

    ctx.save();
    ctx.translate(g.l.x, g.l.y);
    ctx.rotate(g.s.tumblerAngle);

    g.l.spotInfo.forEach(p => {
        ctx.beginPath();
        ctx.arc(
            Math.cos(p.a) * p.r,
            Math.sin(p.a) * p.r,
            p.pr,
            0,
            Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${p.f * 0.4})`;
        ctx.fill();
    });

    ctx.restore();
}
        
function drawScratches(g) {
    const ctx = g.l.c
    
    ctx.save();
    ctx.translate(g.l.x, g.l.y);
    ctx.rotate(g.s.tumblerAngle);

    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 0.5;
    
    g.l.scratchInfo.forEach(s => {
        ctx.beginPath();
        ctx.arc(0, 0, s.r, s.a, s.a + s.pa);
        ctx.stroke();
    });

    ctx.restore();
}

export {
    drawScratches,
    drawSpots,
    drawFancyText,
    drawEllipsis,
    drawButtonPanel,
    drawStatusBox,
    drawText,
    drawTitlePanel,
    drawBackground,
    drawRadialArrow,
    drawPins,
    drawPin,
    drawCylinder,
    drawTextArc,
    drawPlug,
    drawTickMarks,
    drawKeyway,
    drawTumbler
};