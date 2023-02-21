class Punto {
    constructor(x, y, hidden=true) {
        this.x = x;
        this.y = y;
        this.xzoom = x;
        this.yzoom = y;
        this.hidden = hidden;
    }

    draw() {
        fill('#fff');
        noStroke();
        circle(this.getX(), this.getY(), max(10, 10 * scala));
    }

    drawSelected() {
        fill('#018ad3');
        strokeWeight(2);
        stroke('#000');
        rect(min(this.getX() - 7.5, this.x + (greenLineX - 7.5) * scala), min(this.y + redLineY * scala - 7.5, this.y + (redLineY - 7.5) * scala), max(15, 15 * scala), max(15, 15 * scala));
    }

    checkEvts() {
        if(this.collide() && !oneThingSelected && !menuOpened) {
            this.drawSelected();
            cursor('pointer');
            greenDashedLine(this.getX());
            redDashedLine(this.getY());
            oneThingSelected = true;
        } else if(!this.hidden) {
            this.draw();
            cursor('crosshair');
        }
    }

    collide() {
        return dist(mouseX, mouseY, this.getX(), this.getY()) <= max(10, 10 * scala) / 2;
    }

    getX() {
        return this.x + greenLineX * scala;
    }
    getY() {
        return this.y + redLineY * scala;
    }
}

class Line {
    punti = [];
    caract = {
        dashed: false,
        colorStroke: null,
        weight: null,
        mode: 'create line'
    };

    constructor(arrP) {
        this.punti = arrP;
        setCaractsLine(this.caract);
    }

    draw() {
        if(elementSelected === this) {
            setCaractDaInput();
            let m = getMoves();
            for(let i = 0; i < this.punti.length; i ++) {
                this.punti[i].x = puntiElSelected[i].x + m.x;
                this.punti[i].y = puntiElSelected[i].y + m.y;
            }
        } else if(!oneThingSelected && !inCreation && this.collide() && !menuOpened) {
            oneThingSelected = this.collide();
            possibleElementSelected = this;
            strokeWeight(this.caract.weight + 2);
            stroke('#ffae00');
            drawingContext.setLineDash([1]);
        } else {
            stroke(this.caract.colorStroke);
            strokeWeight(this.caract.weight);
            if(this.caract.dashed)
                drawingContext.setLineDash([20, 20]);
            else
                drawingContext.setLineDash([1]);
        }

        let t = this.punti;
        for(let k = 0; k < t.length - 1; k ++)
            line(t[k].getX(), t[k].getY(), t[k + 1].getX(), t[k + 1].getY());
        drawingContext.setLineDash([1]);
    }

    __collideLine(p1, p2) {
        let dist1 = dist(p1.getX(), p1.getY(), mouseX, mouseY);
        let dist2 = dist(p2.getX(), p2.getY(), mouseX, mouseY);

        let distTot = dist(p1.getX(), p1.getY(), p2.getX(), p2.getY());

        return dist1 + dist2 >= distTot - this.caract.weight / 4 && dist1 + dist2 <= distTot + this.caract.weight / 4;
    }

    apply() {
        setCaracts(this.caract);
    }

    collide() {
        let t = this.punti;
        for(let k = 0; k < t.length - 1; k ++)
            if(this.__collideLine(t[k], t[k + 1]))
                return true;
        return false;
    }
}

class Ellisse {
    punti = {
        centro: undefined,
        punti: []
    };
    caract = {
        fillColor: null,
        colorStroke: null,
        weight: null,
        dashed: false,
        width: null,
        height: null,
        mode: 'create ellipse'
    };

    constructor(c, p1) {
        c.hidden = false;
        this.punti.centro = c;
        punti.push(this.punti.centro);
        this.punti.punti.push(new Punto(c.x, c.y - abs(c.y - p1.y)));
        this.punti.punti.push(new Punto(c.x, c.y + abs(c.y - p1.y)));
        this.punti.punti.push(new Punto(c.x + abs(c.x - p1.x), c.y));
        this.punti.punti.push(new Punto(c.x - abs(c.x - p1.x), c.y));

        this.caract.width = abs(c.getX() - p1.getX()) * 2 / SCALA_1_CM;
        this.caract.height = abs(c.getY() - p1.getY()) * 2 / SCALA_1_CM;
        setCaracts(this.caract);

        this.punti.punti.forEach(e => {
            punti.push(e);
        });
    }

    draw() {
        if(elementSelected === this) {
            setCaractDaInput();
            let _width = document.getElementsByName('width')[0].value;
            let _height = document.getElementsByName('height')[0].value;
            this.caract.width = _width === ''? 0: parseFloat(_width);
            this.caract.height = _height === ''? 0: parseFloat(_height);
            setMovesConCentroEllRombo(this.punti);
        } else if(!oneThingSelected && !inCreation && this.collide() && !menuOpened) {
            possibleElementSelected = this;
            oneThingSelected = this.collide();
            stroke('#ffae00');
            strokeWeight(this.caract.weight + 3);
            fill('rgba(255,232,113,0.43)');
        } else {
            stroke(this.caract.colorStroke);
            strokeWeight(this.caract.weight);
            if(this.caract.fillColor == null)
                noFill();
            else
                fill(this.caract.fillColor);

            if(this.caract.dashed)
                drawingContext.setLineDash([20, 20]);
            else
                drawingContext.setLineDash([1]);
        }

        ellipse(this.punti.centro.getX(), this.punti.centro.getY(), this.caract.width * scala * SCALA_1_CM, this.caract.height * scala * SCALA_1_CM);
        drawingContext.setLineDash([1]);
    }

    collide() {
        const rx = this.caract.width / 2 * scala * SCALA_1_CM, ry = this.caract.height / 2 * scala * SCALA_1_CM;
        const cx = this.punti.centro.getX(), cy = this.punti.centro.getY();
        let x = mouseX, y = mouseY;

        if (x > cx + rx || x < cx - rx || y > cy + ry || y < cy - ry || (y >= cy - 3 && y <= cy + 3 && x >= cx - 3 && x <= cx + 3)) // se è fuori o tocca il punto centrale
            return false;

        x -= cx;
        y -= cy;
        let y1 = ry * sqrt(abs(rx ** 2 - x ** 2)) / rx; // valore è in base a x
        return y <= y1 && y >= -y1;
    }

    apply() {
        setCaracts(this.caract);
    }
}

class Rombo {
    punti = {
        centro: undefined,
        punti: []
    };
    caract = {
        fillColor: null,
        colorStroke: null,
        weight: null,
        dashed: false,
        width: null,
        height: null,
        mode: 'create rombo'
    };

    constructor(c, p2) {
        this.punti.centro = c;
        punti.push(this.punti.centro);
        this.punti.punti.push(new Punto(c.x - abs(c.x - p2.x), c.y));
        this.punti.punti.push(new Punto(c.x, c.y - abs(c.y - p2.y)));
        this.punti.punti.push(new Punto(c.x + abs(c.x - p2.x), c.y));
        this.punti.punti.push(new Punto(c.x, c.y + abs(c.y - p2.y)));

        this.caract.width = abs(c.getX() - p2.getX()) * 2 / SCALA_1_CM;
        this.caract.height = abs(c.getY() - p2.getY()) * 2 / SCALA_1_CM;
        setCaracts(this.caract);

        this.punti.punti.forEach(e => {
            punti.push(e);
        });
    }

    draw() {
        if(elementSelected === this) {
            setCaractDaInput();
            let _width = document.getElementsByName('width')[0].value;
            let _height = document.getElementsByName('height')[0].value;
            this.caract.width = _width === ''? 0: parseFloat(_width);
            this.caract.height = _height === ''? 0: parseFloat(_height);

            this.punti.punti[0].x = this.punti.centro.x - this.caract.width * SCALA_1_CM / 2;
            this.punti.punti[2].x = this.punti.centro.x + this.caract.width * SCALA_1_CM / 2;
            this.punti.punti[1].y = this.punti.centro.y - this.caract.height * SCALA_1_CM / 2;
            this.punti.punti[3].y = this.punti.centro.y + this.caract.height * SCALA_1_CM / 2;
            
            setMovesConCentroEllRombo(this.punti);
        } else if(!oneThingSelected && !inCreation && this.collide() && !menuOpened) {
            possibleElementSelected = this;
            oneThingSelected = this.collide();
            stroke('#ffae00');
            strokeWeight(this.caract.weight + 3);
            fill('rgba(255,232,113,0.43)');
        } else {
            stroke(this.caract.colorStroke);
            strokeWeight(this.caract.weight);
            if(this.caract.fillColor == null)
                noFill();
            else
                fill(this.caract.fillColor);

            if(this.caract.dashed)
                drawingContext.setLineDash([20, 20]);
            else
                drawingContext.setLineDash([1]);
        }

        quad(this.punti.punti[0].getX(), this.punti.punti[0].getY(), this.punti.punti[1].getX(), this.punti.punti[1].getY(),
            this.punti.punti[2].getX(), this.punti.punti[2].getY(), this.punti.punti[3].getX(), this.punti.punti[3].getY());
    }

    collide() {
        return collidePolygon(this.punti.punti);
    }

    apply() {
        setCaracts(this.caract);
    }
}

class Circonf {
    punti = {
        centro: undefined,
        angles: []
    };
    caract = {
        fillColor: null,
        colorStroke: null,
        weight: null,
        dashed: false,
        diametro: null,
        mode: null
    };

    constructor(p, raggio, actCarica=null) {
        punti.push(p);
        setCaracts(this.caract);
        this.caract.mode = String(action);
        this.caract.diametro = raggio * 2 / SCALA_1_CM / scala;
        this.punti.centro = p;
        this.__setAngle(actCarica != null);
    }

    __setAngle(onCarica) {
        if(!onCarica)
            deletePunti(this.punti, this.caract.mode);
        this.punti.angles = [];
        let raggio = this.caract.diametro / 2;
        for(let k = 0; k < 360; k += 45) {
            let t = new Punto(cos(radians(k)) * raggio + this.punti.centro.x, sin(radians(k)) * raggio + this.punti.centro.y);
            punti.push(t);
            this.punti.angles.push(t);
        }
    }

    draw() {
        if(elementSelected === this) {
            setCaractDaInput();
            let _raggio = document.getElementsByName('raggio')[0].value;
            this.caract.diametro = (_raggio === '')? 0: parseFloat(_raggio) * 2;  
            setMovesConCentro(this.punti);
        } else if(!oneThingSelected && !inCreation && this.collide() && !menuOpened) {
            possibleElementSelected = this;
            oneThingSelected = this.collide();
            stroke('#ffae00');
            strokeWeight(3);
            fill('rgba(255,232,113,0.43)');
        } else {
            stroke(this.caract.colorStroke);
            strokeWeight(this.caract.weight);
            if(this.caract.fillColor == null)
                noFill();
            else
                fill(this.caract.fillColor);

            if(this.caract.dashed)
                drawingContext.setLineDash([20, 20]);
            else
                drawingContext.setLineDash([1]);
        }

        circle(this.punti.centro.getX(), this.punti.centro.getY(), this.caract.diametro * scala * SCALA_1_CM);
        drawingContext.setLineDash([1]);
    }

    collide() {
        let r = this.caract.diametro * scala / 2 * SCALA_1_CM;
        let d = dist(mouseX, mouseY, this.punti.centro.getX(), this.punti.centro.getY());
        return d <= r && d > 3.5;
    }

    apply() {
        setCaracts(this.caract);
        this.__setAngle(false);
    }
}

class Arc {
    punti = {
        centro: undefined,
        punti: []
    };
    caract = {
        colorStroke: null,
        weight: null,
        dashed: false,
        raggio: null,
        mode: null
    };
    isVisible = true;
    MIN_DIAMETRO = 0.7;

    constructor(centro, p1, p2, raggio) {
        this.punti.centro = centro;
        this.punti.punti.push(p1);
        this.punti.punti.push(p2);

        setCaractsLine(this.caract);
        this.caract.mode = String(action);
        this.caract.raggio = raggio / SCALA_1_CM;

        punti.push(centro);
        this.punti.punti.forEach(e => {
            punti.push(e);
        });
    }

    draw() {
        let xC = this.punti.centro.getX(), yC = this.punti.centro.getY();
        let x0 = this.punti.punti[0].getX(), y0 = this.punti.punti[0].getY();
        let x1 = this.punti.punti[1].getX(), y1 = this.punti.punti[1].getY();
        let angle1 = (y0 < yC) ? 2 * PI - acos((x0 - xC) / (this.caract.raggio * SCALA_1_CM * scala)) : acos((x0 - xC) / (this.caract.raggio * SCALA_1_CM * scala));
        let angle2 = (y1 < yC) ? 2 * PI - acos((x1 - xC) / (this.caract.raggio * SCALA_1_CM * scala)) : acos((x1 - xC) / (this.caract.raggio * SCALA_1_CM * scala));

        if(elementSelected === this) {
            setCaractDaInput();
            let _ra = document.getElementsByName('raggio')[0].value;
            let oldR = this.caract.raggio;
            _ra = (_ra === '')? 0: parseFloat(_ra);
            if(_ra < this.MIN_DIAMETRO) {
                this.isVisible = false;
                this.caract.raggio = this.MIN_DIAMETRO;
            } else if(!isNaN(angle2) && !isNaN(angle1)) {
                this.isVisible = true;
                this.caract.raggio = _ra;
                this.punti.centro.y += (_ra - oldR);
            }
            setMovesConCentroEllRombo(this.punti);
        } else if(!oneThingSelected && !inCreation && this.collide() && !menuOpened) {
            possibleElementSelected = this;
            oneThingSelected = this.collide();
            stroke('#ffae00');
            strokeWeight(this.caract.weight + 2);
        } else {
            stroke(this.caract.colorStroke);
            strokeWeight(this.caract.weight);
            if(this.caract.dashed)
                drawingContext.setLineDash([20, 20]);
        }
        noFill();
        if(this.isVisible)
            arc(this.punti.centro.getX(), this.punti.centro.getY(), this.caract.raggio * SCALA_1_CM * 2 * scala, this.caract.raggio * SCALA_1_CM * 2 * scala, angle1, angle2);
        drawingContext.setLineDash([1]);
    }

    collide() {
        let xC = this.punti.centro.getX(), yC = this.punti.centro.getY();
        let x0 = this.punti.punti[0].getX(), y0 = this.punti.punti[0].getY();
        let x1 = this.punti.punti[1].getX(), y1 = this.punti.punti[1].getY();
        let angle1 = TWO_PI - ((y0 < yC) ? 2 * PI - acos((x0 - xC) / (this.caract.raggio * SCALA_1_CM * scala)) : acos((x0 - xC) / (this.caract.raggio * SCALA_1_CM * scala)));
        let angle2 = TWO_PI - ((y1 < yC) ? 2 * PI - acos((x1 - xC) / (this.caract.raggio * SCALA_1_CM * scala)) : acos((x1 - xC) / (this.caract.raggio * SCALA_1_CM * scala)));
        let angleM = TWO_PI - ((mouseY < yC) ? 2 * PI - acos((mouseX - xC) / (dist(mouseX, mouseY, xC, yC) * SCALA_1_CM * scala)) : acos((mouseX - xC) / (dist(mouseX, mouseY, xC, yC) * SCALA_1_CM * scala)));

        let r = this.caract.raggio * scala * SCALA_1_CM;
        let d = dist(mouseX, mouseY, xC, yC);

        if(d > r + 2 || d < r - 2)
            return false;
        if (angle1 < angle2)
            return angleM < angle1 || angleM > angle2;
        return angleM < angle1 && angleM > angle2;
    }

    apply() {
        setCaracts(this.caract);
    }
}

class Rectangle {
    punti = {
        angles: [],
        mids: []
    };
    caract = {
        fillColor: null,
        colorStroke: null,
        weight: null,
        dashed: false,
        width: null,
        height: null,
        mode: null
    };

    constructor(p1, p2, p3=null, p4=null) {
        this.punti.angles.push(p1);
        this.punti.angles.push(p2);
        this.caract.mode = String(action);
        setCaracts(this.caract);

        if(action === 'create rect 3p') {
            this.caract.width = abs(p2.x - p1.x) / SCALA_1_CM;
            this.caract.height = abs(p1.y - p4.y) / SCALA_1_CM;

            this.punti.angles.push(p3);
            this.punti.angles.push(p4);

            this.__setMids3p(p1, p2, p3, p4)
        } else {
            if(action === 'create rect 2p') {
                this.caract.width = (p2.x - p1.x) / SCALA_1_CM;
                this.caract.height = (p1.y - p2.y) / SCALA_1_CM;
            } else {
                this.caract.width = -p3 / SCALA_1_CM;
                this.caract.height = -p4 / SCALA_1_CM;
            }
            this.punti.angles.push(new Punto(p1.x, p2.y));
            this.punti.angles.push(new Punto(p2.x, p1.y));

            this.__setMids(p1, p2);
        }

        this.punti.angles.forEach(e => {
            punti.push(e);
        });
        this.punti.mids.forEach(e => {
            punti.push(e);
        });
    }

    __setMids(p1, p2) {
        this.punti.mids = [];
        let _minX = min(p1.x, p2.x), _maxX = max(p1.x, p2.x);
        let _minY = min(p1.y, p2.y), _maxY = max(p1.y, p2.y);
        this.punti.mids.push(new Punto(_minX + (_maxX - _minX) / 2, p1.y));
        this.punti.mids.push(new Punto(_minX + (_maxX - _minX) / 2, p2.y));
        this.punti.mids.push(new Punto(p1.x, _minY + (_maxY - _minY) / 2));
        this.punti.mids.push(new Punto(p2.x, _minY + (_maxY - _minY) / 2));
    }

    __setMids3p(p1, p2, p3, p4) {
        let _minX = min(p1.x, p2.x), _maxX = max(p1.x, p2.x);
        let _minY = min(p1.y, p2.y), _maxY = max(p1.y, p2.y);
        this.punti.mids.push(new Punto(_minX + (_maxX - _minX) / 2, _minY + (_maxY - _minY) / 2));
        _minX = min(p3.x, p4.x);
        _maxX = max(p3.x, p4.x);
        _minY = min(p3.y, p4.y);
        _maxY = max(p3.y, p4.y);
        this.punti.mids.push(new Punto(_minX + (_maxX - _minX) / 2, _minY + (_maxY - _minY) / 2));
        _minX = min(p1.x, p4.x);
        _maxX = max(p1.x, p4.x);
        _minY = min(p1.y, p4.y);
        _maxY = max(p1.y, p4.y);
        this.punti.mids.push(new Punto(_minX + (_maxX - _minX) / 2, _minY + (_maxY - _minY) / 2));
        _minX = min(p3.x, p2.x);
        _maxX = max(p3.x, p2.x);
        _minY = min(p3.y, p2.y);
        _maxY = max(p3.y, p2.y);
        this.punti.mids.push(new Punto(_minX + (_maxX - _minX) / 2, _minY + (_maxY - _minY) / 2));
    }

    draw() {
        if(elementSelected === this) {
            setCaractDaInput();
            let _width = document.getElementsByName('width')[0].value;
            let _height = document.getElementsByName('height')[0].value;
            let newWidth = _width === ''? 0: parseFloat(_width);
            let newHeight = _height === ''? 0: parseFloat(_height);
            let p = this.punti.angles;

            if(this.caract.mode !== 'create rect 3p') {
                if(p[0].x > p[1].x) {
                    p[0].x = p[1].x + newWidth * SCALA_1_CM;
                    p[2].x = p[1].x + newWidth * SCALA_1_CM;
                    this.caract.width = (this.caract.mode === 'create rect ce')? newWidth: -newWidth;
                } else {
                    p[1].x = p[0].x + newWidth * SCALA_1_CM;
                    p[3].x = p[0].x + newWidth * SCALA_1_CM;
                    this.caract.width = (this.caract.mode === 'create rect ce')? -newWidth: newWidth;
                }
                if(p[0].y < p[1].y) {
                    p[1].y = p[0].y + newHeight * SCALA_1_CM;
                    p[2].y = p[0].y + newHeight * SCALA_1_CM;
                    this.caract.height = -newHeight;
                } else {
                    p[0].y = p[1].y + newHeight * SCALA_1_CM;
                    p[3].y = p[1].y + newHeight * SCALA_1_CM;
                    this.caract.height = newHeight;
                }
            } else {
                if(p[0].x < p[1].x) {
                    let _newHeight = newWidth / SCALA_1_CM * (p[1].getY() - p[0].getY()) / this.caract.width;
                    p[1].x = p[0].x + newWidth * SCALA_1_CM;
                    p[1].y = p[0].y + _newHeight * SCALA_1_CM;
                    p[2].x = p[3].x + newWidth * SCALA_1_CM;
                    p[2].y = p[3].y + _newHeight * SCALA_1_CM;
                } else {
                    let _newHeight = newWidth / SCALA_1_CM * (p[0].getY() - p[1].getY()) / this.caract.width;
                    p[0].x = p[1].x + newWidth * SCALA_1_CM;
                    p[0].y = p[1].y + _newHeight * SCALA_1_CM;
                    p[3].x = p[2].x + newWidth * SCALA_1_CM;
                    p[3].y = p[2].y + _newHeight * SCALA_1_CM;
                }
                this.caract.width = newWidth;
                if(p[1].y < p[2].y) {
                    let _newWidth = newHeight / SCALA_1_CM * (p[2].getX() - p[1].getX()) / this.caract.height;
                    p[2].y = p[1].y + newHeight * SCALA_1_CM;
                    p[2].x = p[1].x + _newWidth * SCALA_1_CM;
                    p[3].y = p[0].y + newHeight * SCALA_1_CM;
                    p[3].x = p[0].x + _newWidth * SCALA_1_CM;
                } else {
                    let _newWidth = newHeight / SCALA_1_CM * (p[1].getX() - p[2].getX()) / this.caract.height;
                    p[1].y = p[2].y + newHeight * SCALA_1_CM;
                    p[1].x = p[2].x + _newWidth * SCALA_1_CM;
                    p[0].y = p[3].y + newHeight * SCALA_1_CM;
                    p[0].x = p[3].x + _newWidth * SCALA_1_CM;
                }
                this.caract.height = newHeight;
            }

            let m = getMoves();
            p = this.punti;
            for(let k = 0; k < p.angles.length; k ++) {
                p.angles[k].x = puntiElSelected.angles[k].x + m.x;
                p.angles[k].y = puntiElSelected.angles[k].y + m.y;
                p.angles[k].xzoom = puntiElSelected.angles[k].xzoom + m.x;
                p.angles[k].yzoom = puntiElSelected.angles[k].yzoom + m.y;
                p.mids[k].x = puntiElSelected.mids[k].x + m.x;
                p.mids[k].y = puntiElSelected.mids[k].y + m.y;
                p.mids[k].xzoom = puntiElSelected.mids[k].xzoom + m.x;
                p.mids[k].yzoom = puntiElSelected.mids[k].yzoom + m.y;
            }
        } else if(!oneThingSelected && !inCreation && this.collide() && !menuOpened) {
            possibleElementSelected = this;
            oneThingSelected = this.collide();
            stroke('#ffae00');
            strokeWeight(this.caract.weight + 3);
            fill('rgba(255,232,113,0.43)');
        } else {
            stroke(this.caract.colorStroke);
            strokeWeight(this.caract.weight);
            if(this.caract.fillColor == null)
                noFill();
            else
                fill(this.caract.fillColor);

            if(this.caract.dashed)
                drawingContext.setLineDash([20, 20]);
            else
                drawingContext.setLineDash([1]);
        }

        let t = this.punti.angles;
        if(this.caract.mode === 'create rect 3p') {
            beginShape();
            quad(t[0].getX(), t[0].getY(), t[1].getX(), t[1].getY(), t[2].getX(), t[2].getY(), t[3].getX(), t[3].getY());
            endShape(CLOSE);
        } else if(this.caract.mode === 'create rect 2p')
            rect(t[0].getX(), t[1].getY(), this.caract.width * SCALA_1_CM * scala, this.caract.height * SCALA_1_CM * scala);
        else
            rect(t[0].getX(), t[1].getY(), -this.caract.width * SCALA_1_CM * scala, this.caract.height * SCALA_1_CM * scala);
        drawingContext.setLineDash([1]);
    }

    collide() {
        if(this.caract.mode === 'create rect 3p')
            return collidePolygon(this.punti.angles);
        else {
            let p1 = this.punti.angles[0], p2 = this.punti.angles[1];
            return mouseX >= min(p1.getX(), p2.getX()) && mouseX <= max(p1.getX(), p2.getX()) && mouseY >= min(p1.getY(), p2.getY()) && mouseY <= max(p1.getY(), p2.getY());
        }
    }

    apply() {
        setCaracts(this.caract);
        let p = this.punti.angles;
        if(this.caract.mode === 'create rect 3p')
            this.__setMids3p(p[0], p[1], p[2], p[3]);
        else
            this.__setMids(p[0], p[1]);
    }
}

class Polig {
    punti = {
        centro: null,
        angles: []
    };
    caract = {
        fillColor: null,
        colorStroke: null,
        weight: null,
        diametro: null,
        dashed: false,
        mode: null,
        nLati: null,
        angle: null
    };
    MIN_DIAMETRO = 0.7;
    isVisible = true;

    constructor(centro, punto1, caract=null) {
        if(caract == null) {
            let nLati = parseInt(document.getElementsByName('n-lati')[0].value);
            setCaracts(this.caract);
            this.caract.mode = String(action);
            this.caract.nLati = nLati;
            this.caract.angle = 360 / nLati;
        } else
            this.caract = caract;

        this.punti.centro = centro;
        this.caract.diametro = dist(centro.getX(), centro.getY(), punto1.getX(), punto1.getY()) * 2 / SCALA_1_CM;

        if(action === 'create pol insc')
            this.__setPuntiPolInsc(punto1);
        else {
            this.__setPuntiPolCirc(punto1);
            let p = this.punti.angles[0];
            this.caract.diametro = dist(centro.getX(), centro.getY(), p.getX(), p.getY()) * 2 / SCALA_1_CM;
        }

        centro.hidden = false;
        punti.push(centro);
        this.punti.angles.forEach(e => {
           punti.push(e);
        });
    }

    __setPuntiPolInsc(p) {
        let alfa = this.__getAlfa(p);
        deletePunti(this.punti, 'create pol insc');

        this.punti.angles = [];
        this.punti.angles.push(p);
        for(let k = 0; k < this.caract.nLati - 1; k ++, alfa += radians(this.caract.angle)) {
            let x2 = this.punti.centro.getX() + cos(alfa + radians(this.caract.angle)) * this.caract.diametro * SCALA_1_CM / 2;
            let y2 = this.punti.centro.getY() - sin(alfa + radians(this.caract.angle)) * this.caract.diametro * SCALA_1_CM/ 2;
            let p2 = new Punto(toCoordX(x2), toCoordY(y2));
            this.punti.angles.push(p2);
        }
    }

    __setPuntiPolCirc(p) {
        this.punti.angles = [];
        let alfa = this.__getAlfa(p) + radians(this.caract.angle / 2);
        let i = this.caract.diametro * SCALA_1_CM / 2 / cos(radians(this.caract.angle / 2));
        for(let k = 0; k < this.caract.nLati; k ++, alfa += radians(this.caract.angle)) {
            let p2x = this.punti.centro.getX() + cos(alfa) * i;
            let p2y = this.punti.centro.getY() - sin(PI - alfa) * i;
            let p2 = new Punto(toCoordX(p2x), toCoordY(p2y));
            this.punti.angles.push(p2);
            punti.push(p2)
        }
    }

    __getAlfa(p) {
        let alfa = asin((this.punti.centro.getY() - p.getY()) / (this.caract.diametro * SCALA_1_CM / 2));
        if (p.getX() < this.punti.centro.getX())
            alfa = PI - alfa;
        return alfa;
    }

    draw() {
        if(elementSelected === this) {
            setCaractDaInput();
            let c = this.punti.centro;
            let _raggio = document.getElementsByName('raggio')[0].value;
            let raggio = (_raggio === '') ? this.MIN_DIAMETRO: max(parseFloat(_raggio), this.MIN_DIAMETRO);
            let _nLati = document.getElementsByName('n-lati')[0].value;
            _nLati = (_nLati === '') ? 0: parseInt(_nLati);
            if(_nLati >= 3) {
                this.caract.nLati = _nLati;
                this.caract.angle = 360 / _nLati;
            }

            let p = this.punti.angles[0];
            let w1 = raggio * (p.getX() - c.getX()) / (this.caract.diametro / 2);
            let h1 = raggio * (p.getY() - c.getY()) / (this.caract.diametro / 2);

            this.caract.diametro = max(raggio * 2, this.MIN_DIAMETRO);
            let __p = new Punto(toCoordX(c.getX() + w1), toCoordY(c.getY() + h1));
            this.isVisible = _raggio !== '' && parseFloat(_raggio) !== 0;
            setMovesConCentro(this.punti);

            this.__setPuntiPolInsc(__p);
            this.punti.angles.forEach(e => punti.push(e));
            punti.push(this.punti.centro);
        } else if(!oneThingSelected && !inCreation && this.collide() && !menuOpened) {
            possibleElementSelected = this;
            oneThingSelected = this.collide();
            stroke('#ffae00');
            strokeWeight(this.caract.weight + 3);
            fill('rgba(255,232,113,0.43)');
            drawingContext.setLineDash([1]);
        } else {
            stroke(this.caract.colorStroke);
            strokeWeight(this.caract.weight);
            if(this.caract.fillColor == null)
                noFill();
            else
                fill(this.caract.fillColor);
            if (this.caract.dashed)
                drawingContext.setLineDash([20, 20]);
            else
                drawingContext.setLineDash([1]);
        }

        if(this.isVisible) {
            beginShape();
            let p = this.punti.angles;
            for (let __p of p)
                vertex(__p.getX(), __p.getY());
            endShape(CLOSE);
            for (let k = 0; k < p.length - 1; k++)
                line(p[k].getX(), p[k].getY(), p[k + 1].getX(), p[k + 1].getY());
            line(p[p.length - 1].getX(), p[p.length - 1].getY(), p[0].getX(), p[0].getY());
            drawingContext.setLineDash([1]);
        }
    }

    collide() {
        return collidePolygon(this.punti.angles);
    }

    apply() {
        setCaracts(this.caract);
    }
}

class Spline {
    punti = [];
    caract = {
        dashed: false,
        colorStroke: null,
        weight: null,
        mode: null
    };

    constructor(arrP) {
        setCaractsLine(this.caract);
        this.caract.mode = String(action);
        this.punti = arrP;

        if (action === 'create spline p contr') {
            let t = this.punti[1];
            this.punti[1] = this.punti[2];
            this.punti[2] = t;
            for (let k = 0; k < this.punti.length; k += 2)
                punti.push(this.punti[k]);
        } else {
            this.punti.push(arrP[arrP.length - 1]);
            this.punti.forEach(e => {
                punti.push(e);
            });
        }
    }

    draw() {
        noFill();
        stroke(this.caract.colorStroke);
        strokeWeight(this.caract.weight);
        if(this.caract.dashed)
            drawingContext.setLineDash([20, 20]);
        else
            drawingContext.setLineDash([1]);

        beginShape();
        let t = this.punti;
        if(this.caract.mode === 'create spline p contr')
            for(let k = 3; k <= (t.length % 2 === 1 ? t.length - 1: t.length); k += 2)
                bezier(t[k - 3].getX(), t[k - 3].getY(), t[k - 2].getX(), t[k - 2].getY(), t[k].getX(), t[k].getY(), t[k - 1].getX(), t[k - 1].getY());
         else
            for(let p of t)
                curveVertex(p.getX(), p.getY());
        endShape();
        drawingContext.setLineDash([1]);
    }
}

function collidePolygon(arrP) {
    let collide = false;
    const Y = mouseY;

    for (let i = 0, j = 1; i < arrP.length; i ++, j ++) {
        if (j === arrP.length)
            j = 0;
        let p0 = arrP[i];
        let p1 = arrP[j];

        if ((p0.getY() >= Y && p1.getY() < Y || p0.getY() < Y && p1.getY() >= Y) && mouseX < (p1.getX() - p0.getX()) * (Y - p0.getY()) / (p1.getY() - p0.getY()) + p0.getX())
            collide = !collide;
    }
    return collide;
}

function setCaractsLine(car) {
    if(document.getElementsByName('stroke')[0] !== undefined) { // basta solo questo al controllo
        car.colorStroke = document.getElementsByName('stroke')[0].value;
        car.dashed = document.getElementsByName('dashed')[0].checked;
        car.weight = parseInt(document.getElementsByName('weight')[0].value);
    }
}

function setCaracts(car) {
    if(document.getElementsByName('stroke')[0] !== undefined) { // basta solo questo al controllo
        car.colorStroke = document.getElementsByName('stroke')[0].value;
        car.dashed = document.getElementsByName('dashed')[0].checked;
        car.weight = parseInt(document.getElementsByName('weight')[0].value);
        if (document.getElementsByName('noFill')[0] !== undefined) {
            if (document.getElementsByName('noFill')[0].checked)
                car.fillColor = null;
            else
                car.fillColor = document.getElementsByName('fill')[0].value;
        }
    }
}

function setCaractDaInput() {
    stroke(document.getElementsByName('stroke')[0].value);
    strokeWeight(document.getElementsByName('weight')[0].value);

    if(document.getElementsByName('dashed')[0].checked)
        drawingContext.setLineDash([20, 20]);
    else
        drawingContext.setLineDash([1]);

    if(document.getElementsByName('noFill')[0] !== undefined) {
        if(document.getElementsByName('noFill')[0].checked)
            noFill();
        else
            fill(document.getElementsByName('fill')[0].value);
    }
}

function deletePunti(p, mode, alsoC=false) {
    let arrPunti;
    if(mode === 'create line')
        arrPunti = p;
    else if(mode.indexOf(' pol ') !== -1 || mode.indexOf(' ci ') !== -1) {
        arrPunti = p.angles;
        if(alsoC)
            arrPunti.push(p.centro);
    } else if(mode.indexOf(' rect ') !== -1) {
        arrPunti = p.angles;
        for(let __p of p.mids)
            arrPunti.push(__p);
    } else if(mode.indexOf(' arc ') !== -1 || mode === 'create ellipse' || mode === 'create rombo') {
        arrPunti = p.punti;
        if(alsoC)
            arrPunti.push(p.centro);
    }

    for(let __p of arrPunti) {
        let i = punti.indexOf(__p);
        delete punti[i];
        for(let __i = i + 1; __i < punti.length; __i ++)
            punti[__i - 1] = punti[__i];
        punti.pop();
    }

    if(punti[-1] !== undefined)
        punti = [];
    else if(punti.length === 0)
        punti.push(new Punto(0, 0, false));
}

function deleteElementSelected() {
    clearInputs();

    let arrT;
    if(caractsElSeletced.mode === 'create line')
        arrT = linee;
    /*else if(caractsElSeletced.mode.indexOf(' spline ') !== -1)
        arrT = splines;*/
    else if(caractsElSeletced.mode.indexOf(' arc ') !== -1)
        arrT = arcs;
    else
        arrT = objs;
    deletePunti(elementSelected.punti, elementSelected.caract.mode, true);
    let ind = arrT.indexOf(elementSelected);
    delete arrT[ind];
    for(let k = ind + 1; k < arrT.length; k ++)
        arrT[k - 1] = arrT[k];
    arrT.pop();

    elementSelected = undefined;
    caractsElSeletced = undefined;
    puntiElSelected = undefined;
}

function applyModify() {
    elementSelected.apply();
    elementSelected = undefined;
    caractsElSeletced = undefined;
    puntiElSelected = undefined;
    clearInputs();
}

function getMoves() {
    let _moveX = document.getElementsByName('xMoved')[0].value;
    let moveX = (_moveX === '')? 0: parseFloat(_moveX) * SCALA_1_CM;
    let _moveY = document.getElementsByName('yMoved')[0].value;
    let moveY = (_moveY === '')? 0: -parseFloat(_moveY) * SCALA_1_CM;

    return {
        x: moveX,
        y: moveY
    };
}

function setMovesConCentro(p) {
    let m = getMoves();
    p.centro.x = puntiElSelected.centro.x + m.x;
    p.centro.y = puntiElSelected.centro.y + m.y;
    p.centro.xzoom = puntiElSelected.centro.xzoom + m.x;
    p.centro.yzoom = puntiElSelected.centro.yzoom + m.y;
    for(let k = 0; k < p.angles.length; k ++) {
        p.angles[k].x = puntiElSelected.angles[k].x + m.x;
        p.angles[k].y = puntiElSelected.angles[k].y + m.y;
        p.angles[k].xzoom = puntiElSelected.angles[k].xzoom + m.x;
        p.angles[k].yzoom = puntiElSelected.angles[k].yzoom + m.y;
    }
}

function setMovesConCentroEllRombo(p) {
    let m = getMoves();
    p.centro.x = puntiElSelected.centro.x + m.x;
    p.centro.y = puntiElSelected.centro.y + m.y;
    p.centro.xzoom = puntiElSelected.centro.xzoom + m.x;
    p.centro.yzoom = puntiElSelected.centro.yzoom + m.y;
    for(let k = 0; k < p.punti.length; k ++) {
        p.punti[k].x = puntiElSelected.punti[k].x + m.x;
        p.punti[k].y = puntiElSelected.punti[k].y + m.y;
        p.punti[k].xzoom = puntiElSelected.punti[k].xzoom + m.x;
        p.punti[k].yzoom = puntiElSelected.punti[k].yzoom + m.y;
    }
}