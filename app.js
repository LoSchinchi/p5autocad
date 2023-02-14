let scala = 1;
let greenLineX, redLineY;
const SCALA_1_CM = 30;
let isMuoviCanva = false;

let punti = [];
let linee = [];
let arcs = [];
let splines = [];
let objs = [];

let action = null;
let inCreation = false;
let puntiPerObjs = [];

let oneThingSelected = false;
let elementSelected = undefined;
let possibleElementSelected = undefined;
let caractsElSeletced = undefined;
let puntiElSelected = undefined;

function setup() {
    angleMode(RADIANS);
    createCanvas(windowWidth - 500, windowHeight - 200);
    background('rgba(58,57,57,0.86)');
    frameRate(50);

    greenLineX = width / 2;
    redLineY = height / 2;
    punti.push(new Punto(0, 0, false));

    createInputsAndButtons();
}

function draw() {
    background('rgba(58,57,57,0.86)');
    drawLines();

    if (inCreation)
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

    if(!(mouseX > width || mouseY > height || mouseY < 0 || mouseX < 0))
        setMousePressed();

    if(action == null && !mouseIsPressed && mouseButton !== 'center')
        cursor('auto');
    if(nTimePressed !== 0 && !mouseIsPressed)
        nTimePressed = 0;

    if(isMuoviCanva)
        cursor('grab');
    else if(oneThingSelected)
        cursor('pointer');
    if(punti === [] || (punti[0].x !== 0 && punti[0].y !== 0))
        punti.unshift(new Punto(0, 0, false));

    oneThingSelected = false;
    possibleElementSelected = undefined;
}

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

    if (action === 'create line') {
        let i;
        for(i = 0; i < puntiPerObjs.length - 1; i ++)
            line(puntiPerObjs[i].getX(), puntiPerObjs[i].getY(), puntiPerObjs[i + 1].getX(), puntiPerObjs[i + 1].getY());
        line(puntiPerObjs[i].getX(), puntiPerObjs[i].getY(), mouseX, mouseY);
    } else if (action === 'create ci raggio') {
        circle(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), int(sqrt((mouseX - puntiPerObjs[0].getX()) ** 2 + (mouseY - puntiPerObjs[0].getY()) ** 2)) * 2);  // * 2 pk lavora sul diametro
        drawDashedLine(0);
    } else if (action === 'create ci diam') {
        circle(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), dist(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), mouseX, mouseY) * 2);  // * 2 pk lavora sul diametro
        drawingContext.setLineDash([20, 20]);
        stroke('#ff0');
        line(puntiPerObjs[0].getX() * 2 - mouseX, puntiPerObjs[0].getY() * 2 - mouseY, mouseX, mouseY);
        drawingContext.setLineDash([1]);
        stroke('#ffffeb');
    } else if (action === 'create ci 2p') {
        let xC = puntiPerObjs[0].getX() + (mouseX - puntiPerObjs[0].getX()) / 2;
        let yC = puntiPerObjs[0].getY() + (mouseY - puntiPerObjs[0].getY()) / 2;
        circle(xC, yC, dist(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), xC, yC) * 2);
        drawDashedLine(0);
    } else if (action === 'create rect 2p') {
        rect(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), mouseX - puntiPerObjs[0].getX(), mouseY - puntiPerObjs[0].getY());
        drawDashedLine(0);
    } else if (action === 'create rect 3p') {
        if (puntiPerObjs.length === 1)
            line(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), mouseX, mouseY);
        else {
            let punti = this.getPuntiLinea2();
            drawDashedLine(1);
            beginShape();
            quad(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), puntiPerObjs[1].getX(), puntiPerObjs[1].getY(), punti.xBasso1, punti.yBasso1, punti.xBasso2, punti.yBasso2)
            endShape(CLOSE);
        }
    } else if (action === 'create rect ce') {
        if (mouseX === puntiPerObjs[0].getX() || mouseY === puntiPerObjs[0].getY())
            return;
        drawDashedLine(0);
        rect(mouseX, mouseY, (puntiPerObjs[0].getX() - mouseX) * 2, (puntiPerObjs[0].getY() - mouseY) * 2);
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
            let x0 = puntiPerObjs[0].getX(), y0 = puntiPerObjs[0].getY();
            let x1 = puntiPerObjs[1].getX(), y1 = puntiPerObjs[1].getY();
            let raggio = dist(xC, yC, x0, y0);

            let angle1 = (y0 < yC) ? 2 * PI - acos((x0 - xC) / raggio) : acos((x0 - xC) / raggio);
            let angle2 = (y1 < yC) ? 2 * PI - acos((x1 - xC) / raggio) : acos((x1 - xC) / raggio);

            drawingContext.setLineDash([20, 20]);
            stroke('#ff0');
            arc(xC, yC, raggio * 2, raggio * 2, angle2, angle1);
            line(xC, yC, x0, y0);
            line(xC, yC, x1, y1);
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
        drawDashedCirconf();
        drawDashedLine(0);
        if (document.getElementsByName('dashed')[0].checked)
            drawingContext.setLineDash([20, 20]);
        else
            drawingContext.setLineDash([1]);
        if(document.getElementsByName('noFill')[0].checked)
            noFill();
        else
            fill(document.getElementsByName('fill')[0].value);

        let x = puntiPerObjs[0].getX(), y = puntiPerObjs[0].getY();
        let raggio = dist(x, y, mouseX, mouseY);
        let alfa = asin((y - mouseY) / raggio)
        if(action === 'create pol circ')
            alfa += radians(angle / 2);
        if(mouseX < x)
            alfa = PI - alfa;
        else if(mouseY > y)
            alfa = TWO_PI + alfa;

        if (action === 'create pol circ') {
            let i = raggio / cos(radians(angle / 2));
            beginShape();
            for(let k = 0; k < nLati; k ++, alfa+=radians(angle)) {
                let p2x = x + cos(alfa) * i;
                let p2y = y - sin(PI - alfa) * i;
                vertex(p2x, p2y);
            }
            endShape(CLOSE);
            for(let k = 0; k < nLati; k ++, alfa+=radians(angle)) {
                let r = mouseX > x ? radians(angle / 2) : -radians(angle / 2)
                let p1x = x + cos(alfa - r) * raggio;
                let p1y = y - sin(alfa - r) * raggio;
                let p2x = x + cos(alfa) * i;
                let p2y = y - sin(PI - alfa) * i;
                let m = (p2y - p1y) / (p2x - p1x);
                let q = p1y - m * p1x;
                let p3x = 2 * p1x - p2x;
                let p3y = m * p3x + q;

                line(p2x, p2y, p3x, p3y);
            }
        } else {
            beginShape();
            for (let k = 0; k < nLati; k++, alfa += radians(angle)) {
                let x2 = x + cos(alfa + radians(angle)) * raggio;
                let y2 = y - sin(alfa + radians(angle)) * raggio;
                vertex(x2, y2);
            }
            endShape(CLOSE);
            for (let k = 0, precX = mouseX, precY = mouseY; k < nLati; k++, alfa += radians(angle)) {
                let x2 = x + cos(alfa + radians(angle)) * raggio;
                let y2 = y - sin(alfa + radians(angle)) * raggio;
                line(precX, precY, x2, y2);
                precX = x2;
                precY = y2;
            }
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
    } else if(action === 'create ellipse') {
        ellipse(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), abs(puntiPerObjs[0].getX() - mouseX) * 2, abs(puntiPerObjs[0].getY() - mouseY) * 2);

        drawingContext.setLineDash([20, 20]);
        stroke('#ff0');
        strokeWeight(2);
        line(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), mouseX, mouseY);
        line(puntiPerObjs[0].getX(), mouseY, mouseX, mouseY);
        line(mouseX, puntiPerObjs[0].getY(), mouseX, mouseY);
        drawingContext.setLineDash([1]);
        strokeWeight(document.getElementsByName('stroke')[0].value);
        stroke('#ffffeb');
    } else if(action === 'create rombo') {
        let x = puntiPerObjs[0].getX(), y = puntiPerObjs[0].getY();
        quad(x - abs(x - mouseX), y, x, y - abs(y - mouseY), x + abs(x - mouseX), y, x, y + abs(y - mouseY));

        drawingContext.setLineDash([20, 20]);
        stroke('#ff0');
        strokeWeight(2);
        line(x, y, mouseX, mouseY);
        line(x, mouseY, mouseX, mouseY);
        line(mouseX, y, mouseX, mouseY);
        strokeWeight(document.getElementsByName('stroke')[0].value);
        drawingContext.setLineDash([1]);
        stroke('#ffffeb');
    }
    
    strokeWeight(2);
    stroke('#fff');
    drawingContext.setLineDash([1]);
    noFill();
}

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

function setObjPunti(x, y, np) {
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

function insInArray() {
    if(action === 'create ci raggio' || action === 'create ci diam') {
        puntiPerObjs[0].hidden = false;
        let r = dist(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), puntiPerObjs[1].getX(), puntiPerObjs[1].getY());
        objs.push(new Circonf(puntiPerObjs[0], r));
        puntiPerObjs.pop(); // tolgo l'ultimo
    } else if(action === 'create ci 2p') {
        let xC = puntiPerObjs[0].getX() + (puntiPerObjs[1].getX() - puntiPerObjs[0].getX()) / 2;
        let yC = puntiPerObjs[0].getY() + (puntiPerObjs[1].getY() - puntiPerObjs[0].getY()) / 2;
        let r = dist(puntiPerObjs[0].getX(), puntiPerObjs[0].getY(), xC, yC);

        objs.push(new Circonf(new Punto(toCoordX(xC), toCoordY(yC), false), r));
        puntiPerObjs = [];
    } else if(action === 'create rect 2p')
        objs.push(new Rectangle(puntiPerObjs[0], puntiPerObjs[1]));
    else if(action === 'create rect 3p') {
        let punti = this.getPuntiLinea2();
        objs.push(new Rectangle(puntiPerObjs[0], puntiPerObjs[1], new Punto(toCoordX(punti.xBasso1), toCoordY(punti.yBasso1)), new Punto(toCoordX(punti.xBasso2), toCoordY(punti.yBasso2))));
    } else if(action === 'create rect ce' && mouseX !== puntiPerObjs[0].getX() && mouseY !== puntiPerObjs[0].getY()) {
        let x1 = mouseX, y1 = mouseY;
        let x2 = x1 + (puntiPerObjs[0].getX() - x1) * 2;
        let y2 = y1 + (puntiPerObjs[0].getY() - y1) * 2;

        objs.push(new Rectangle(puntiPerObjs[1], new Punto(toCoordX(x2), toCoordY(y2)), (puntiPerObjs[0].getX() - x1) * 2, (puntiPerObjs[0].getY() - y1) * 2));
        puntiPerObjs = [];
    } else if(action === 'create ci 3p' || action === 'create arc 3p') {
        let centro = getCenterFrom3Points(puntiPerObjs[2].getX(), puntiPerObjs[2].getY());
        let xC = centro.x, yC = centro.y;
        let raggio = dist(xC, yC, puntiPerObjs[2].getX(), puntiPerObjs[2].getY());

        if(action === 'create ci 3p')
            objs.push(new Circonf(new Punto(toCoordX(xC), toCoordY(yC), false), raggio));
        else
            arcs.push(new Arc(new Punto(toCoordX(xC), toCoordY(yC), false), new Punto(puntiPerObjs[0].x, puntiPerObjs[0].y), new Punto(puntiPerObjs[1].x, puntiPerObjs[1].y), raggio));
        puntiPerObjs = [];
    } else if(action === 'create arc ce 1p') {
        let xC = puntiPerObjs[0].getX(), yC = puntiPerObjs[0].getY();
        let raggio = dist(xC, yC, puntiPerObjs[1].getX(), puntiPerObjs[1].getY());

        arcs.push(new Arc(new Punto(toCoordX(xC), toCoordY(yC), false), new Punto(puntiPerObjs[1].x, puntiPerObjs[1].y), new Punto(puntiPerObjs[2].x, puntiPerObjs[2].y), raggio));
        puntiPerObjs = [];
    } else if(action === 'create pol insc' || action === 'create pol circ') {
        objs.push(new Polig(puntiPerObjs[0], puntiPerObjs[1]));
        puntiPerObjs = [];
    } else if(action === 'create ellipse') {
        objs.push(new Ellisse(puntiPerObjs[0], puntiPerObjs[1]));
        puntiPerObjs = [];
    } else if(action === 'create rombo') {
        objs.push(new Rombo(puntiPerObjs[0], puntiPerObjs[1]));
        puntiPerObjs = [];
    }

    clearInputs();
    setInputs();
}

function redDashedLine(y) {
    drawingContext.setLineDash([20, 20]);
    strokeWeight(1);
    stroke('#f00')
    line(0, y, width, y);
    drawingContext.setLineDash([1]);

}

function greenDashedLine(x) {
    drawingContext.setLineDash([20, 20]);
    strokeWeight(1);
    stroke('#0f0')
    line(x, 0, x, height);
    drawingContext.setLineDash([1]);
}

function getPuntiLinea2() {
    let mLineaAlta = (puntiPerObjs[0].getY() - puntiPerObjs[1].getY()) / (puntiPerObjs[0].getX() - puntiPerObjs[1].getX());
    let mLinea1 = -1 / mLineaAlta;
    let qLinea1 = puntiPerObjs[1].getY() - mLinea1 * puntiPerObjs[1].getX();

    let qLineaBassa = mouseY - mLineaAlta * mouseX;
    let xBasso1 = (qLinea1 - qLineaBassa) / (mLineaAlta - mLinea1);
    let yBasso1 = mLineaAlta * xBasso1 + qLineaBassa;

    let qLinea2 = puntiPerObjs[0].getY() - mLinea1 * puntiPerObjs[0].getX();
    let xBasso2 = (qLinea2 - qLineaBassa) / (mLineaAlta - mLinea1);
    let yBasso2 = mLinea1 * xBasso2 + qLinea2;

    return {
        xBasso1: xBasso1,
        yBasso1: yBasso1,
        xBasso2: xBasso2,
        yBasso2: yBasso2
    };
}

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
        setInputs();
        puntiPerObjs = [];
        inCreation = false;
    }
}

function toCoordX(x) {
    return int(x - greenLineX * scala);
}

function  toCoordY(y) {
    return int(y - redLineY * scala);
}

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

function presetScala() {
    scala = 1;
}

function presetLines() {
    greenLineX = width / 2 / scala;
    redLineY = height / 2 / scala;
}

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

function adaptCanvas() {
    createCanvas(windowWidth - 500, windowHeight - 200);
}