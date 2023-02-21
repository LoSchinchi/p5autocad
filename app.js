let scala = 1;                                      // (number) variabile della scala per ingrandire e rimpicciolire
let greenLineX, redLineY, startXline, startYline;   // (number * 4) variabili delle posizioni degli assi, ci si basa sul loro valore per disegnare gli oggetti
const SCALA_1_CM = 30;                              // (number) distanza tra due linee nel canvas
let canvaInMovimento = false;                       // (boolean) variabile per sapere se l'utente si sta spostando nel canvas
let wWidth, wHeight;                                // (number * 2) variabili che valgono le precedenti dimensioni del canvas

let punti = [];                                     // ([Punto, ...]) array dei punti
let linee = [];                                     // ([Line, ...]) array delle linee
let arcs = [];                                      // ([Arc, ...]) array degli archi
let splines = [];                                   // ([Spline, ...]) array delle spline
let objs = [];                                      // ([Ellisse | Rombo | Circonf | Rectangle | Polig, ...]) array degli oggetti pieni

let action = null;                                  // (string | null) variabile che dice l'azione = all'elemento in creazione
let inCreation = false;                             // (boolean) variabile che dice se un pezzo è in creazione
let puntiPerObjs = [];                              // ([Punto, ...] array dei punti dell'elemento in creazione

let oneThingSelected = false;                       // (boolean) indica se c'è un elemento selezionato
let elementSelected = undefined;                    // (Line, Arc, Ellisse | Rombo | Circonf | Rectangle | Polig | undefined) variabile uguale all'elemento selezionato
let possibleElementSelected = undefined;            // (Line, Arc, Ellisse | Rombo | Circonf | Rectangle | Polig | undefined) variabile uguale all'elemento sotto il mouse o undefined
let caractsElSeletced = undefined;                  // (Object | undefined) l'attributo caract di elementSelected (per quando non si applicano le modifiche)
let puntiElSelected = undefined;                    // (Object | undefined) l'attributo punti di elementSelected (per quando non si applicano le modifiche)

//--- (void) funzione setup da implementare se si usa p5
function setup() {
    angleMode(RADIANS);
    createCanvas(windowWidth - 500, windowHeight - 200);
    background('rgba(58,57,57,0.86)');
    frameRate(50);
    
    wWidth = windowWidth;
    wHeight = windowHeight;
    greenLineX = width / 2;
    redLineY = height / 2;
    startXline = width / 2;
    startYline = height / 2;

    punti.push(new Punto(0, 0, false));
    createInputsAndButtons();
}

//--- (void) funzione draw da implementare se si usa p5
function draw() {
    background('rgba(58,57,57,0.86)');
    drawLines();

    if(inCreation)
        setInCreation();

    for (let l of linee)
        l.draw();
    for (let s of splines)
        s.draw();
    for (let a of arcs)
        a.draw();
    for (let o of [...objs].reverse())
        o.draw();

    for (let p of punti)
        p.checkEvts();
    for(let p of puntiPerObjs)
        p.checkEvts();

    if(!mouseLeftOfCanvas())
        setMousePressed();

    if(action == null && !mouseIsPressed && mouseButton !== 'center')
        cursor('auto');
    if(nTimePressed !== 0 && !mouseIsPressed)
        nTimePressed = 0;

    if(canvaInMovimento)
        cursor('grab');
    else if(oneThingSelected)
        cursor('pointer');
    if(punti === [] || (punti[0].x !== 0 && punti[0].y !== 0))
        punti.unshift(new Punto(0, 0, false));

    if(windowHeight !== wHeight || windowWidth !== wWidth) {
        createCanvas(windowWidth - 500, windowHeight - 200);
        greenLineX += (windowWidth - wWidth) / 2;
        redLineY += (windowHeight - wHeight) / 2;
        startXline += (windowWidth - wWidth) / 2;
        startYline += (windowHeight - wHeight) / 2;
        wWidth = windowWidth;
        wHeight = windowHeight;
    }

    oneThingSelected = false;
    possibleElementSelected = undefined;
}

// --- (void) disegna l'oggetto o la linea prima di completare l'oggetto, eseguita solo se inCreation == true
function setInCreation() {
    if (action == null)
        return;

    strokeWeight(parseInt(document.getElementsByName('weight')[0].value));
    stroke(document.getElementsByName('stroke')[0].value);
    if (document.getElementsByName('dashed')[0].checked)
        drawingContext.setLineDash([20, 20]);
    else
        drawingContext.setLineDash([1]);

    if(action !== 'create line' && action.indexOf('spline') === -1 && action.indexOf('arc') === -1) {
        if(document.getElementsByName('noFill')[0].checked)
            noFill();
        else
            fill(document.getElementsByName('fill')[0].value);
    } else
        noFill();

    const X = puntiPerObjs[0].getX(), Y = puntiPerObjs[0].getY(); // per semplicità
    if (action === 'create line') {
        let i;
        for(i = 0; i < puntiPerObjs.length - 1; i ++)
            line(puntiPerObjs[i].getX(), puntiPerObjs[i].getY(), puntiPerObjs[i + 1].getX(), puntiPerObjs[i + 1].getY());
        line(puntiPerObjs[i].getX(), puntiPerObjs[i].getY(), mouseX, mouseY);
    } else if (action === 'create ci raggio') {
        let inpR = document.getElementsByName('raggio')[0];
        let rag = dist(X, Y, mouseX, mouseY);

        if(!mouseLeftOfCanvas())
            inpR.value = (rag / SCALA_1_CM / scala).toFixed(3).toString();
        let d = inpR.value === ''? 0: max(0, parseFloat(inpR.value) * 2 * SCALA_1_CM * scala); // *2 pk serve il diametro

        circle(X, Y, d);
        if(!mouseLeftOfCanvas())
            drawDashedLine(0);
        else {
            drawingContext.setLineDash([20, 20]);
            stroke('#ff0');
            strokeWeight(2);
            line(X, Y, X + d / 2, Y);
        }
    } else if (action === 'create ci diam') {
        let inpD = document.getElementsByName('raggio')[0];
        let diam = dist(X, Y, mouseX, mouseY) * 2;

        if(!mouseLeftOfCanvas())
            inpD.value = (diam / SCALA_1_CM / scala).toFixed(3).toString();
        let d = inpD.value === ''? 0: max(0, parseFloat(inpD.value) * SCALA_1_CM * scala);

        circle(X, Y, d);
        drawingContext.setLineDash([20, 20]);
        stroke('#ff0');
        strokeWeight(2);
        if(!mouseLeftOfCanvas())
            line(X * 2 - mouseX, Y * 2 - mouseY, mouseX, mouseY);
        else
            line(X - d / 2, Y, X + d / 2, Y);
    } else if (action === 'create ci 2p') {
        let inpD = document.getElementsByName('raggio')[0];
        let xC = X + (mouseX - X) / 2, yC = Y + (mouseY - Y) / 2;
        let diam = dist(X, Y, xC, yC) * 2;

        if(!mouseLeftOfCanvas())
            inpD.value = (diam / SCALA_1_CM / scala).toFixed(3).toString();
        let d = inpD.value === ''? 0: max(0, parseFloat(inpD.value) * SCALA_1_CM * scala);
        
        if(!mouseLeftOfCanvas()) {
            drawDashedLine(0);
            circle(xC, yC, d);
        } else {
            circle(X + d / 2, Y, d);
            stroke('#ff0');
            strokeWeight(2);
            drawingContext.setLineDash([20, 20]);
            line(X, Y, X + d, Y);
        }
    } else if (action === 'create rect 2p') {
        let width = document.getElementsByName('width')[0];
        let height = document.getElementsByName('height')[0];

        if(!mouseLeftOfCanvas()) {
            width.value = (abs(X - mouseX) / SCALA_1_CM).toFixed(3).toString();
            height.value = (abs(Y - mouseY) / SCALA_1_CM).toFixed(3).toString();
        }
        let w = width.value === ''? 0: max(0, parseFloat(width.value) * SCALA_1_CM);
        let h = height.value === ''? 0: max(0, parseFloat(height.value) * SCALA_1_CM);

        if(!mouseLeftOfCanvas()) {
            rect(X, Y, mouseX - X, mouseY - Y);
            drawDashedLine(0);
        } else {
            rect(X, Y, w, h);
            stroke('#ff0');
            strokeWeight(2);
            drawingContext.setLineDash([20, 20]);
            line(X, Y, X + w, Y + h);
        }
    } else if (action === 'create rect 3p') {
        let width = document.getElementsByName('width')[0];
        let height = document.getElementsByName('height')[0];

        if (puntiPerObjs.length === 1) {
            if(!mouseLeftOfCanvas())
                width.value = (abs(X - mouseX) / SCALA_1_CM).toFixed(3).toString();

            let w = width.value === ''? 0: max(0, parseFloat(width.value) * SCALA_1_CM);
            if(mouseLeftOfCanvas())
                line(X, Y, X + w, Y);
            else
                line(X, Y, mouseX, mouseY);
        } else {
            let punti;
            if(!mouseLeftOfCanvas())
                height.value = (abs(puntiPerObjs[1].getY() - mouseY) / SCALA_1_CM).toFixed(3).toString();

            let h = height.value === ''? 0: max(0, parseFloat(height.value) * SCALA_1_CM);
            if(!mouseLeftOfCanvas()) {
                punti = getPuntiLinea2();
                drawDashedLine(1);
            } else {
                punti = getPuntiLinea2(h);
            }

            beginShape();
            quad(X, Y, puntiPerObjs[1].getX(), puntiPerObjs[1].getY(), punti.xBasso1, punti.yBasso1, punti.xBasso2, punti.yBasso2)
            endShape(CLOSE);
        }
    } else if (action === 'create rect ce') {
        let width = document.getElementsByName('width')[0];
        let height = document.getElementsByName('height')[0];

        if(!mouseLeftOfCanvas()) {
            width.value = (abs(X - mouseX) / SCALA_1_CM * 2).toFixed(3).toString();
            height.value = (abs(Y - mouseY) / SCALA_1_CM * 2).toFixed(3).toString();
        }
        let w = width.value === ''? 0: max(0, parseFloat(width.value) * SCALA_1_CM);
        let h = height.value === ''? 0: max(0, parseFloat(height.value) * SCALA_1_CM);

        if(!mouseLeftOfCanvas()) {
            drawDashedLine(0);
            rect(mouseX, mouseY, (X - mouseX) * 2, (Y - mouseY) * 2);
        } else {
            rect(X - w / 2, Y - h / 2, w, h);
            stroke('#ff0');
            strokeWeight(2);
            drawingContext.setLineDash([20, 20]);
            line(X, Y, X + w / 2, Y + h / 2);
        }
    } else if (action === 'create ci 3p') {
        if (puntiPerObjs.length > 0)
            puntiPerObjs[0].draw();
        if (puntiPerObjs.length > 1)
            puntiPerObjs[1].draw();
    } else if (action === 'create arc 3p') {
        if (puntiPerObjs.length === 1)
            puntiPerObjs[0].draw();
        if (puntiPerObjs.length === 2) {
            let centro = getCenterFrom3Points(mouseX, mouseY);
            let xC = centro.x, yC = centro.y;
            const X0 = X, Y0 = Y;
            const X1 = puntiPerObjs[1].getX(), Y1 = puntiPerObjs[1].getY();
            let raggio = dist(xC, yC, X0, Y0);

            let angle1 = (Y0 < yC) ? 2 * PI - acos((X0 - xC) / raggio) : acos((X0 - xC) / raggio);
            let angle2 = (Y1 < yC) ? 2 * PI - acos((X1 - xC) / raggio) : acos((X1 - xC) / raggio);

            drawingContext.setLineDash([20, 20]);
            stroke('#ff0');
            arc(xC, yC, raggio * 2, raggio * 2, angle2, angle1);
            line(xC, yC, X0, Y0);
            line(xC, yC, X1, Y1);
            if(!(document.getElementsByName('dashed')[0].checked))
                drawingContext.setLineDash([1]);
            stroke(document.getElementsByName('stroke')[0].value);

            noFill();
            arc(xC, yC, raggio * 2, raggio * 2, angle1, angle2);
            puntiPerObjs[0].draw();
            puntiPerObjs[1].draw();
            new Punto(toCoordX(xC), toCoordY(yC)).draw();
        }
    } else if (action === 'create arc ce 1p') {
        if (puntiPerObjs.length === 1) {
            puntiPerObjs[0].draw();
            drawingContext.setLineDash([20, 20]);
            stroke('#ff0');
            noFill();
            circle(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), dist(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), mouseX, mouseY) * 2);
            line(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), mouseX, mouseY);
            drawingContext.setLineDash([1]);
            stroke('#ffffeb');
        } else if (puntiPerObjs.length === 2) {
            let xC = puntiPerObjs[0].getX(), yC = puntiPerObjs[0].getY();
            let x0 = puntiPerObjs[1].getX(), y0 = puntiPerObjs[1].getY();
            let raggio = dist(xC, yC, x0, y0);
            let angle1 = (y0 < yC) ? 2 * PI - acos((x0 - xC) / raggio) : acos((x0 - xC) / raggio);
            let angle2 = (mouseY < yC) ? 2 * PI - acos((mouseX - xC) / raggio) : acos((mouseX - xC) / raggio);

            noFill();
            arc(xC, yC, raggio * 2, raggio * 2, angle1, angle2);
            puntiPerObjs[0].draw();
            puntiPerObjs[1].draw();
        }
    } else if (action === 'create pol insc' || action === 'create pol circ') {
        let nLati = parseInt(document.getElementsByName('n-lati')[0].value);
        const angle = 360 / nLati;
        if (document.getElementsByName('dashed')[0].checked)
            drawingContext.setLineDash([20, 20]);
        else
            drawingContext.setLineDash([1]);
        if(document.getElementsByName('noFill')[0].checked)
            noFill();
        else
            fill(document.getElementsByName('fill')[0].value);

        let inpR = document.getElementsByName('raggio')[0];
        let rag = dist(X, Y, mouseX, mouseY);
        let alfa, raggio = inpR.value === ''? 0: max(0, parseFloat(inpR.value) * SCALA_1_CM);
        let precX = mouseLeftOfCanvas()? X + raggio: mouseX;
        let precY = mouseLeftOfCanvas()? Y: mouseY;

        if(!mouseLeftOfCanvas()) {
            inpR.value = (rag / SCALA_1_CM).toFixed(3).toString();
            alfa = asin((Y - mouseY) / raggio);
            if(action === 'create pol circ')
                alfa += radians(angle / 2);
            if(mouseX < X)
                alfa = PI - alfa;
            else if(mouseY > Y)
                alfa = TWO_PI + alfa;
        } else
            alfa = action === 'create pol insc'? 0: radians(angle / 2);
    
        if (action === 'create pol circ') {
            let i = raggio / cos(radians(angle / 2));
            beginShape();
            for(let k = 0; k < nLati; k ++, alfa += radians(angle)) {
                let p2x = X + cos(alfa) * i;
                let p2y = Y - sin(PI - alfa) * i;
                vertex(p2x, p2y);
            }
            endShape(CLOSE);
            for(let k = 0; k < nLati; k ++, alfa += radians(angle)) {
                let r = mouseX > X || mouseLeftOfCanvas()? radians(angle / 2) : -radians(angle / 2)
                let p1x = X + cos(alfa - r) * raggio;
                let p1y = Y - sin(alfa - r) * raggio;
                let p2x = X + cos(alfa) * i;
                let p2y = Y - sin(PI - alfa) * i;
                let m = (p2y - p1y) / (p2x - p1x);
                let q = p1y - m * p1x;
                let p3x = 2 * p1x - p2x;
                let p3y = m * p3x + q;

                line(p2x, p2y, p3x, p3y);
            }
        } else {
            beginShape();
            for (let k = 0; k < nLati; k++, alfa += radians(angle)) {
                let x2 = X + cos(alfa + radians(angle)) * raggio;
                let y2 = Y - sin(alfa + radians(angle)) * raggio;
                vertex(x2, y2);
            }
            endShape(CLOSE);
            for (let k = 0; k < nLati; k++, alfa += radians(angle)) {
                let x2 = X + cos(alfa + radians(angle)) * raggio;
                let y2 = Y - sin(alfa + radians(angle)) * raggio;
                line(precX, precY, x2, y2);
                precX = x2;
                precY = y2;
            }
        }
        if(mouseLeftOfCanvas()) {
            drawingContext.setLineDash([20, 20]);
            stroke('#ff0');
            strokeWeight(2);
            line(X, Y, precX, precY);
            circle(X, Y, raggio * 2);
        } else {
            drawDashedCirconf();
            drawDashedLine(0);
        }
    } else if (action === 'create spline adapted') {
        beginShape();
        for(let p of puntiPerObjs)
            curveVertex(p.getX(), p.getY());
        curveVertex(mouseX, mouseY);
        curveVertex(mouseX, mouseY);
        endShape();
    } else if (action === 'create spline p contr') {
        let len = puntiPerObjs.length;
        if (len === 1)
            line(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), mouseX, mouseY);
        else if (len === 4)
            line(puntiPerObjs[1].getX(), puntiPerObjs[1].getY(), mouseX, mouseY);
        else if (len >= 6 && len % 2 === 0)
            line(puntiPerObjs[len - 2].getX(), puntiPerObjs[len - 2].getY(), mouseX, mouseY);

        if(len === 2)
            line(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), puntiPerObjs[1].getX(), puntiPerObjs[1].getY());

        if (len >= 3) {
            drawDashedLine(0, 2);
            if (len >= 4) {
                drawDashedLine(3, 1);
                for (let k = 6; k <= len; k += 2)
                    drawDashedLine(k - 1, k - 2);
            }
        }

        if(len === 2)
            drawDashedLine(0);
        else if(len === 3)
            drawDashedLine(1);
        else if(len >= 5 && len % 2 === 1)
            drawDashedLine(len - 1);

        if(len === 3)
            drawBezier(0, 1, 2);
        else if(len === 5)
            drawBezier(1, 4, 3);
        else if(len >= 7 && len % 2 === 1)
            drawBezier(len - 3, len - 1, len - 2);

        if(len >= 4) {
            drawBezier(0, 1, 2, 3);
            if(len >= 6) {
                drawBezier(1, 4, 3, 5);
                for(let k = 8; k <= len; k += 2)
                    drawBezier(k - 4, k - 2, k - 3, k - 1);
            }
        }
    } else { // ellisse e rombo
        let width = document.getElementsByName('width')[0];
        let height = document.getElementsByName('height')[0];

        if(!mouseLeftOfCanvas()) {
            width.value = (abs(X - mouseX) * 2 / SCALA_1_CM).toFixed(3).toString();
            height.value = (abs(Y - mouseY) * 2 / SCALA_1_CM).toFixed(3).toString();
        }
        let w = width.value === ''? 0: max(0, parseFloat(width.value) / 2 * SCALA_1_CM);
        let h = height.value === ''? 0: max(0, parseFloat(height.value) / 2 * SCALA_1_CM);

        if(action === 'create ellipse')
            ellipse(X,Y, w * 2, h * 2);
        else
            quad(X - w, Y, X, Y - h, X + w, Y, X, Y + h);

        drawingContext.setLineDash([20, 20]);
        stroke('#ff0');
        strokeWeight(2);
        if(mouseLeftOfCanvas()) {
            line(X, Y, X + w, Y + h);
            line(X, Y + h, X + w, Y + h);
            line(X + w, Y, X + w, Y + h);
        } else {
            line(X, Y, mouseX, mouseY);
            line(X, mouseY, mouseX, mouseY);
            line(mouseX, Y, mouseX, mouseY);
        }
    }
    
    strokeWeight(parseInt(document.getElementsByName('weight')[0].value));
    stroke('#fff');
    drawingContext.setLineDash([1]);
    noFill();
}

//--- (void) disegna una curva di bezier dati due punti e almeno un punto di controllo
//- (Punto, Punto) n1, n2 sono gli indici dei punti d'inizio e arrivo della linea
//- (Punto) c1 è l'indice del punto di controllo per il punto [n1]
//- (Punto | null) c2 opzionale, o è un punto o le coordinate del mouse se == null
function drawBezier(n1, n2, c1, c2=null) {
    noFill();
    beginShape();
    if(document.getElementsByName('dashed')[0].checked)
        drawingContext.setLineDash([20, 20]);
    if(c2 != null)
        bezier(puntiPerObjs[n1].getX(), puntiPerObjs[n1].getY(), puntiPerObjs[c1].getX(), puntiPerObjs[c1].getY(), puntiPerObjs[c2].getX(), puntiPerObjs[c2].getY(), puntiPerObjs[n2].getX(), puntiPerObjs[n2].getY());
    else
        bezier(puntiPerObjs[n1].getX(), puntiPerObjs[n1].getY(), puntiPerObjs[c1].getX(), puntiPerObjs[c1].getY(), mouseX, mouseY, puntiPerObjs[n2].getX(), puntiPerObjs[n2].getY());
    endShape();
    drawingContext.setLineDash([1]);

}

//--- (void) disegna la linea gialla tratteggiata tra due punti
//- (number) n è indice del punto d'inizio linea
//- (number) n1 opzionale, vale l'indice del punto di arrivo o le coordinate del mouse se == null
function drawDashedLine(n, n1=null) {
    drawingContext.setLineDash([20, 20]);
    stroke('#ff0');
    strokeWeight(2);
    if(n1 == null)
        line(puntiPerObjs[n].getX(), puntiPerObjs[n].getY(), mouseX, mouseY);
    else
        line(puntiPerObjs[n].getX(), puntiPerObjs[n].getY(), puntiPerObjs[n1].getX(), puntiPerObjs[n1].getY());
    drawingContext.setLineDash([1]);
    strokeWeight(parseInt(document.getElementsByName('weight')[0].value));
    stroke(document.getElementsByName('stroke')[0].value);
}

//--- (void) disegna la circonferenza gialla tratteggiata tra il punto [0] e le coordinate del mouse
function drawDashedCirconf() {
    drawingContext.setLineDash([20, 20]);
    stroke('#ff0');
    strokeWeight(2);
    noFill();
    circle(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), dist(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), mouseX, mouseY) * 2);
    drawingContext.setLineDash([1]);
    strokeWeight(parseInt(document.getElementsByName('weight')[0].value));
    stroke(document.getElementsByName('stroke')[0].value);
}

//--- (void) disegna le linee grigie di sfondo e quelle rosse e verde a simboleggiare gli assi e le coordinate (0, 0)
function drawLines() {
    stroke('rgba(255,255,255,0.30)');
    strokeWeight(2);
    for(let k = max(greenLineX * scala, 0); k >= 0; k -= SCALA_1_CM * scala)
        line(k, 0, k, height);
    for(let k = min(greenLineX * scala, width); k < width; k += SCALA_1_CM * scala)
        line(k, 0, k, height);
    for(let k = max(redLineY * scala, 0); k >= 0; k -= SCALA_1_CM * scala)
        line(0, k, width, k);
    for(let k = min(redLineY * scala, height); k < height; k += SCALA_1_CM * scala)
        line(0, k, width, k);

    strokeWeight(3);
    stroke('#0f0');
    line(greenLineX * scala, 0, greenLineX * scala, height);
    stroke('#f00');
    line(0, redLineY * scala, width, redLineY * scala);
}

//--- (void) setta e aggiunge punti al vettore puntiPerObjs in base al numero dei punti
//- (number) np è il numero di punti per fare un determinato oggetto, se == -1, l'oggetto può avere infiniti punti
function setObjPunti(np) {
    const x = mouseX, y = mouseY;
    if(menuOpened || mouseOutofCanvas())
        return

    let n = puntiPerObjs.length;
    for(let p of punti)
        if(p.collide(x, y)) {
            puntiPerObjs.push(p);
            break;
        }

    if(oneThingSelected && n === puntiPerObjs.length && !inCreation)
        return;
    if(n === puntiPerObjs.length)
        puntiPerObjs.push(new Punto(int(x - greenLineX * scala), int(y - redLineY * scala)));
    if(action === 'create spline adapted' && puntiPerObjs.length === 1)
        puntiPerObjs.push(puntiPerObjs[0]);
    if(puntiPerObjs.length === np) {
        insInArray();
        if(action === 'create rect 3p')
            puntiPerObjs.pop();

        while(puntiPerObjs.length > 0) {
            let p = puntiPerObjs.pop();
            if(punti.indexOf(p) === -1)
                punti.push(p);
        }
    }
    inCreation = puntiPerObjs.length !== 0;
}

//--- (void) instanzia un oggetto degli array arcs e objs in base all'oggetto da creare e ai punti dell'array puntiPerObjs
function insInArray() {
    const X0 = puntiPerObjs[0].getX(), Y0 = puntiPerObjs[0].getY(), PO = puntiPerObjs[0];
    const X1 = puntiPerObjs[1].getX(), Y1 = puntiPerObjs[1].getY(), P1 = puntiPerObjs[1];
    let X2, Y2, P2;
    if(puntiPerObjs.length >= 3) {
        X2 = puntiPerObjs[2].getX();
        Y2 = puntiPerObjs[2].getY();
        P2 = puntiPerObjs[2];
    } 

    if(action === 'create ci raggio' || action === 'create ci diam') {
        PO.hidden = false;
        objs.push(new Circonf(PO, dist(X0, Y0, X1, Y1)));
    } else if(action === 'create ci 2p') {
        let xC = X0 + (X1 - X0) / 2;
        let yC = Y0 + (Y1 - Y0) / 2;

        objs.push(new Circonf(new Punto(toCoordX(xC), toCoordY(yC), false), dist(X0, Y0, xC, yC)));
        puntiPerObjs = [];
    } else if(action === 'create rect 2p')
        objs.push(new Rectangle(PO, P1));
    else if(action === 'create rect 3p') {
        let punti;
        if(mouseLeftOfCanvas()) {
            let height = document.getElementsByName('height')[0];
            punti = getPuntiLinea2(height.value === ''? 0: max(0, parseFloat(height.value) * SCALA_1_CM));
        } else
            punti = getPuntiLinea2();
        objs.push(new Rectangle(PO, P1, new Punto(toCoordX(punti.xBasso1), toCoordY(punti.yBasso1)), new Punto(toCoordX(punti.xBasso2), toCoordY(punti.yBasso2))));
    } else if(action === 'create rect ce' && X1 !== X0 && Y1 !== Y0) {
        let x1 = X1, y1 = Y1;
        let x2 = x1 + (X0 - x1) * 2;
        let y2 = y1 + (Y0 - y1) * 2;

        objs.push(new Rectangle(P1, new Punto(toCoordX(x2), toCoordY(y2)), (X0 - x1) * 2, (Y0 - y1) * 2));
        puntiPerObjs = [];
    } else if(action === 'create ci 3p' || action === 'create arc 3p') {
        let centro = getCenterFrom3Points(X2, Y2);
        let xC = centro.x, yC = centro.y;
        let raggio = dist(xC, yC, X2, Y2);

        if(action === 'create ci 3p')
            objs.push(new Circonf(new Punto(toCoordX(xC), toCoordY(yC), false), raggio));
        else
            arcs.push(new Arc(new Punto(toCoordX(xC), toCoordY(yC), false), new Punto(PO.x, PO.y), new Punto(P1.x, P1.y), raggio));
        puntiPerObjs = [];
    } else if(action === 'create arc ce 1p') {
        let xC = X0, yC = Y0;
        let raggio = dist(xC, yC, X1, Y1);

        arcs.push(new Arc(new Punto(toCoordX(xC), toCoordY(yC), false), new Punto(P1.x, P1.y), new Punto(P2.x, P2.y), raggio));
        puntiPerObjs = [];
    } else if(action === 'create pol insc' || action === 'create pol circ')
        objs.push(new Polig(PO, P1));
    else if(action === 'create ellipse') {
        objs.push(new Ellisse(PO, P1));
        puntiPerObjs = [];
    } else if(action === 'create rombo') {
        objs.push(new Rombo(PO, P1));
        puntiPerObjs = [];
    }

    clearInputs();
    puntiPerObjs = [];
    inCreation = false;
    if(action.indexOf(' arc ') !== -1)
        setInputAtStart();
    else
        setInputs();
}

//--- (void) disegna la line tratteggiata rossa quando si passa sopra un punto
//- (number) è la y del punto
function redDashedLine(y) {
    drawingContext.setLineDash([20, 20]);
    strokeWeight(1);
    stroke('#f00')
    line(0, y, width, y);
    drawingContext.setLineDash([1]);
}

//--- (void) disegna la line tratteggiata verde quando si passa sopra un punto
//- (number) è la x del punto
function greenDashedLine(x) {
    drawingContext.setLineDash([20, 20]);
    strokeWeight(1);
    stroke('#0f0')
    line(x, 0, x, height);
    drawingContext.setLineDash([1]);
}

//--- ({ number, number, number, number }) trova due punti su una retta parallela alla retta che passa per i primi due punti del vettore puntiPerObjs
//- height è opzionale, se != null è la distanza tra le due rette, altrimenti l'altra retta si calcola in base a mouseY
function getPuntiLinea2(height=null) {
    const X0 = puntiPerObjs[0].getX(), Y0 = puntiPerObjs[0].getY();
    const X1 = puntiPerObjs[1].getX(), Y1 = puntiPerObjs[1].getY();
    const X2 = height == null? mouseX: X0, Y2 = height == null? mouseY: Y0 + height;

    let mLineaAlta = (Y0 - Y1) / (X0 - X1);
    let mLinea1 = -1 / mLineaAlta;
    let qLinea1 = Y1 - mLinea1 * X1;

    let qLineaBassa = Y2 - mLineaAlta * X2;
    let xBasso1 = (qLinea1 - qLineaBassa) / (mLineaAlta - mLinea1);
    let yBasso1 = mLineaAlta * xBasso1 + qLineaBassa;

    let qLinea2 = Y0 - mLinea1 * X0;
    let xBasso2 = (qLinea2 - qLineaBassa) / (mLineaAlta - mLinea1);
    let yBasso2 = mLinea1 * xBasso2 + qLinea2;

    if(height === 0)
        return {
            xBasso1: X1,
            yBasso1: Y1,
            xBasso2: X0,
            yBasso2: Y0
        };

    return {
        xBasso1: xBasso1,
        yBasso1: yBasso1,
        xBasso2: xBasso2,
        yBasso2: yBasso2
    };
}

//--- (void) instanzia o una linea o una spline in base ai punti nel vettore puntiPerObjs (sono da 2 a +infinito)
function setLines() {
    if(action === 'create line' || action === 'create spline adapted' || action === 'create spline p contr') {
        if (action === 'create line')
            linee.push(new Line([...puntiPerObjs]));
        else if (action === 'create spline adapted')
            splines.push(new Spline([...puntiPerObjs]));
        else if (action === 'create spline p contr' && puntiPerObjs.length >= 4)  {
            let t = [...puntiPerObjs];
            if (puntiPerObjs.length % 2 === 1)
                t.pop()
            splines.push(new Spline(t));
        }

        clearInputs();
        puntiPerObjs = [];
        inCreation = false;
        setInputs();
    }
}

//--- (number) restituire la coordinata x geometrica in base alla x sul canvas
//- (number) x è la coordinata sul canvas da trasformare
const toCoordX = x => int(x - greenLineX * scala);

//--- (number) restituire la coordinata y geometrica in base alla y sul canvas
//- (number) y è la coordinata sul canvas da trasformare
const toCoordY = y => int(y - redLineY * scala);

//--- ({ number, number }) dati 3 punti di una circonferenza restituisce il centro di essa
//- (number) x2 è la coordinata x del terzo punto (le altre sono dei primi 2 punti in puntiPerObjs)
//- (number) y2 è la coordinata x del terzo punto (le altre sono dei primi 2 punti in puntiPerObjs)
function getCenterFrom3Points(x2, y2) {
    let x0 = puntiPerObjs[0].getX(), y0 = puntiPerObjs[0].getY();
    let x1 = puntiPerObjs[1].getX(), y1 = puntiPerObjs[1].getY();

    if(x0 === x1 && x1 === x2 || y0 === y1 && y1 === y2)
        return;

    let mAB = (y1 - y0) / (x1 - x0);
    let xAB_m_1 = x0 + (x1 - x0) / 2;
    let yAB_m_1 = y0 + (y1 - y0) / 2;
    let mAB_1 = -1 / mAB;
    let qAB_1 = yAB_m_1 - mAB_1 * xAB_m_1;

    let mBC = (y2 - y1) / (x2 - x1);
    let xBC_m_1 = x1 + (x2 - x1) / 2;
    let yBC_m_1 = y1 + (y2 - y1) / 2;
    let mBC_1 = -1 / mBC;
    let qBC_1 = yBC_m_1 - mBC_1 * xBC_m_1;

    let xC = (qBC_1 - qAB_1) / (mAB_1 - mBC_1);
    let yC = (mAB_1 * xC + qAB_1);

    return {x: xC, y: yC};
}

//--- (void) setta la scala = 1 e cambia la posizione degli assi
function presetScala() {
    greenLineX = startXline / scala;
    redLineY = startYline / scala;
    scala = 1;
}

//--- (void) allinea gli assi al centro del canvas
function presetLines() {
    greenLineX = width / 2 / scala;
    redLineY = height / 2 / scala;
    startXline = width / 2;
    startYline = height / 2; 
}

//--- (void) pulisce il canvas e cancella tutti gli oggetti e le linee
function clearCanvas() {
    linee = [];
    arcs = [];
    objs = [];
    puntiPerObjs = [];
    splines = [];
    punti = [];
    inCreation = false;
    action = undefined;

    punti.push(new Punto(0, 0, false));
    clearInputs();
}

//--- (boolean) ritorna true se il mouse è alla destra (non più alta o bassa) del canvas per la X
const mouseLeftOfCanvas = () => mouseX >= 0 && mouseX > width && mouseY <= height && mouseY >= 0;

//--- (boolean) ritorna true se il mouse è fuori dal canvas
const mouseOutofCanvas = () => mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height;

//--- (void) setta l'ultimo punto di un oggetto o linea per quando si preme INVIO
function setPuntiObjs() {
    if ((action === 'create ci raggio' || action === 'create rect 2p' || action === 'create rect ce' ||
        action === 'create ci diam' || action === 'create ci 2p' || action === 'create pol insc' ||
        action === 'create pol circ' || action === 'create ellipse' || action === 'create rombo') && puntiPerObjs.length !== 1)
        return;
    else if((action === 'create rect 3p' || action === 'create ci 3p' || action === 'create arc 3p' || action === 'create arc ce 1p') && puntiPerObjs.length !== 2)
        return;

    if(mouseLeftOfCanvas()) {
        const X = puntiPerObjs[0].getX(), Y = puntiPerObjs[0].getY();
        let width = document.getElementsByName('width')[0];
        let height = document.getElementsByName('height')[0];
        let inpD_R = document.getElementsByName('raggio')[0];

        let w = width === undefined || width.value === ''? 0: max(0, parseFloat(width.value) / 2 * SCALA_1_CM);
        let h = height === undefined || height.value === ''? 0: max(0, parseFloat(height.value) / 2 * SCALA_1_CM);
        let d = inpD_R === undefined || inpD_R.value === ''? 0: max(0, parseFloat(inpD_R.value) * SCALA_1_CM) * scala;
        let r = inpD_R === undefined || inpD_R.value === ''? 0: max(0, parseFloat(inpD_R.value) / 2 * SCALA_1_CM * scala);

        if(action === 'create ellipse' || action === 'create rombo' || action === 'create rect ce')
            puntiPerObjs.push(new Punto(toCoordX(X + w), toCoordY(Y + h)));
        else if(action === 'create rect 2p')
            puntiPerObjs.push(new Punto(toCoordX(X + 2 * w), toCoordY(Y + 2 * h)));
        else if(action === 'create ci 2p' || action === 'create ci raggio' || action.indexOf(' pol ') !== -1)
            puntiPerObjs.push(new Punto(toCoordX(X + d), toCoordY(Y)));
        else if(action === 'create ci diam')
            puntiPerObjs.push(new Punto(toCoordX(X + r), toCoordY(Y)));
        // per action === 'create rect ce' || action === 'create rect 3p' non serve fare niente
    } else
        puntiPerObjs.push(new Punto(toCoordX(mouseX), toCoordY(mouseY)));
    
    if(action === 'create line' || action.indexOf(' spline ') !== -1)
        setLines();
    else
        insInArray();

}