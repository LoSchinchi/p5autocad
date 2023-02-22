let menuOpened = false;         // (boolean) dice se un menu a tendina è aperto
let saveAs = false;             // (boolean) dice se si sta salvando un progetto
let nameProject = undefined;    // (string | undefined) nome del progetto che si sta utilizzando

//--- (void) aggiunta dell'evento load al window con eventi bootstrap per sapere se un menu a tendina è aperto
addEventListener('load', function() {
    for (let a = 0; a < 5; a ++) {
        let dropdown = document.getElementById('dropdown_' + a.toString());
        
        dropdown.addEventListener('show.bs.dropdown', function() {    
            menuOpened = true;
            action = null;
            inCreation = false;
            puntiPerObjs = [];
        });
        dropdown.addEventListener('hidden.bs.dropdown', function() {
            menuOpened = false;
        });
    }
});

//--- (void) crea i bottoni sotto il canvas
function createInputsAndButtons() {
    let body = document.getElementsByTagName('body')[0];
    let inputs = document.createElement('div')
    inputs.id = 'inputs';
    inputs.style.height = (windowHeight - 195).toString() + 'px';
    body.appendChild(inputs);

    let buttons = document.createElement('div');
    buttons.id = 'buttons';
    let btn1 = document.createElement('button');
    btn1.innerHTML = 'assi al centro';
    btn1.onclick = presetLines;
    let btn2 = document.createElement('button');
    btn2.innerHTML = 'scala di default';
    btn2.onclick = presetScala;
    let btn3 = document.createElement('button');
    btn3.innerHTML = 'pulisci';
    btn3.onclick = clearCanvas;
    let btn4 = document.getElementById('salva-come');
    btn4.onclick = setSaveAs;
    let btn5 = document.getElementById('carica');
    btn5.onclick = setMenuCarica;
    let btn6 = document.createElement('button');
    btn6.innerHTML = 'muovi';
    btn6.onclick = function() {
        canvaInMovimento = !canvaInMovimento;
        this.style.backgroundColor = !canvaInMovimento ? '#212529' : '#fff';
        this.style.color = canvaInMovimento ? '#212529' : '#fff';
    }

    buttons.appendChild(btn1);
    buttons.appendChild(btn2);
    buttons.appendChild(btn3);
    buttons.appendChild(btn4);
    buttons.appendChild(btn5);
    buttons.appendChild(btn6);
    body.appendChild(buttons);
}

//--- (void) funzione dell'evento al click del <button> carica
function setMenuCarica() {
    let foo = document.getElementById('footer-projects');
    if(foo.children.length !== 1) {
        //lascio solo il pulsante close
        foo.removeChild(foo.firstChild);
        foo.removeChild(foo.lastChild);
        foo.removeChild(foo.lastChild);
    }

    let d = document.getElementById('load');
    while(d.childElementCount > 0)
        d.removeChild(d.lastChild);
    for(let i = 0; i < localStorage.length; i ++) {
        let tit = localStorage.key(i);
        let div = document.createElement('div');
        div.onclick = function() {
            setProjectClicked(tit);
        }
        div.className = 'loadTitle';
        div.innerHTML = tit;
        d.appendChild(div);
    }
}

//--- (void) setta la tendina per caricare un progetto e la funzione per caricare esso
function setProjectClicked(tit) {
    let div = document.getElementById('footer-projects');
    let p = document.createElement('p');
    let foo = document.getElementById('footer-projects');
    if(foo.children.length !== 1) {
        //lascio solo il pulsante close
        foo.removeChild(foo.firstChild);
        foo.removeChild(foo.lastChild);
        foo.removeChild(foo.lastChild);
    }
    p.innerHTML = tit;
    p.style.overflow = 'auto';
    div.insertBefore(p, div.firstChild);

    let btn1 = document.createElement('button');
    btn1.className = 'btn btn-danger';
    btn1.innerHTML = 'Elimina';
    btn1.onclick = function() {
        localStorage.removeItem(tit);
        setMenuCarica();
    };
    let btn2 = document.createElement('button');
    btn2.className = 'btn btn-success';
    btn2.innerHTML = 'Carica';
    btn2.onclick = function() {
        let el = JSON.parse(localStorage.getItem(tit));
        linee = [];
        punti = [];
        arcs = [];
        splines = [];
        objs = [];

        for(let li of el.linee) {
            let arrP = [];
            for(let p of li.punti) {
                let t = new Punto(p.x, p.y, p.hidden);
                arrP.push(t);
                punti.push(t);
            }
            let __l = new Line(arrP);
            __l.caract = li.caract;
            linee.push(__l);
        }

        for(let ar of el.archi) {
            let centro = new Punto(ar.punti.centro.x, ar.punti.centro.y, ar.punti.centro.hidden);
            let p1 = new Punto(ar.punti.punti[0].x, ar.punti.punti[0].y, ar.punti.punti[0].hidden);
            let p2 = new Punto(ar.punti.punti[1].x, ar.punti.punti[1].y, ar.punti.punti[1].hidden);
            let __a = new Arc(centro, p1, p2, dist(centro.getX(), centro.getY(), p1.getX(), p2.getY()));
            __a.caract = ar.caract;
            arcs.push(__a);
        }

        for(let sp of el.splines) {
            let arrP = [];
            for(let p of sp.punti)
                arrP.push(new Punto(p.x, p.y, p.hidden));
            let __spl = new Spline(arrP);
            __spl.caract = sp.caract;
            splines.push(__spl);
        }

        for(let ob of el.objs) {
            let t;
            if(ob.caract.mode === 'create ellipse' || ob.caract.mode === 'create rombo') {
                let centro = new Punto(ob.punti.centro.x, ob.punti.centro.y, ob.punti.centro.hidden);
                let p = new Punto(ob.punti.punti[0].x, ob.punti.punti[1].y);
                t = (ob.caract.mode === 'create ellipse')? new Ellisse(centro, p): new Rombo(centro, p);
            } else if(ob.caract.mode.indexOf(' pol ') !== -1 || ob.caract.mode.indexOf(' ci ') !== -1) {
                let centro = new Punto(ob.punti.centro.x, ob.punti.centro.y, true);
                let p = new Punto(ob.punti.angles[0].x, ob.punti.angles[0].y);
                t = (ob.caract.mode.indexOf(' ci ') !== -1)? new Circonf(centro, dist(centro.getX(), centro.getY(), p.getX(), p.getY()), ob.caract.mode): new Polig(centro, p, ob.caract);
            } else if(ob.caract.mode === 'create rect 2p') {
                let p0 = new Punto(ob.punti.angles[0].x, ob.punti.angles[0].y);
                let p1 = new Punto(ob.punti.angles[1].x, ob.punti.angles[1].y);
                action = 'create rect 2p';
                t = new Rectangle(p0, p1);
            } else {
                let p0 = new Punto(ob.punti.angles[0].x, ob.punti.angles[0].y);
                let p1 = new Punto(ob.punti.angles[1].x, ob.punti.angles[1].y);
                let p2 = new Punto(ob.punti.angles[2].x, ob.punti.angles[2].y);
                let p3 = new Punto(ob.punti.angles[3].x, ob.punti.angles[3].y);
                action = 'create rect 3p';
                t = new Rectangle(p0, p1, p2, p3);
            }
            objs.push(t);
            t.caract = ob.caract;
            action = null;
        }

        nameProject = tit;
        setDoubleButton();
    };
    action = null;

    div.appendChild(btn1);
    div.appendChild(btn2);
}

//--- (void) funzione dell'evento al click del <button> salva come
function setSaveAs() {
    let d = new Date();
    let d1 = d.toDateString() + ' ' + d.toTimeString().split(' ')[0];
    document.getElementById('nome-save').value = 'project_' + d1.split(' ').join('_');
    saveAs = true;
}

//--- (void) funzione dell'evento al click del <button> carica
function onSaveAs() {
    let title = document.getElementById('nome-save').value;
    let newEl = [];
    for(let l of linee)
        newEl.push(JSON.parse(JSON.stringify(l)))

    localStorage.setItem(title, JSON.stringify({
        "linee": newEl,
        "archi": arcs,
        "objs": objs,
        "splines": splines,
        "punti": punti
    }));
    saveAs = false;
    nameProject = title;
    setDoubleButton();
}

//--- (void) funzione dell'evento al click del <button> salva
function onSave() {
    localStorage.setItem(nameProject, JSON.stringify({
        "linee": linee,
        "archi": arcs,
        "objs": objs,
        "splines": splines,
        "punti": punti
    }));
}

//--- (void) setta il <div> con doppio bottone <button> salva come e <button> salva
function setDoubleButton() {
    let buttons = document.getElementById('buttons');
    let lastB = buttons.lastChild;
    buttons.removeChild(lastB);

    let div = document.createElement('div');
    div.className = 'btn-group';
    div.ariaRoleDescription = 'group';
    div.ariaLabel = 'Basic example';
    let btn2 = document.createElement('button');
    btn2.onclick = onSave;
    btn2.innerHTML = 'salva';
    div.appendChild(buttons.children[3]);
    div.appendChild(btn2);

    buttons.appendChild(div);
    let btn6 = document.getElementById('carica');
    btn6.onclick = setMenuCarica;
    buttons.appendChild(btn6);

    buttons.appendChild(lastB);
}

//--- (void) aggiunge agli input quelli di bordo / colore, trasparenza, tratteggiato e fill
function setInputs() {
    clearInputs();
    let inps = document.getElementById('inputs');
    let inpColor = __createInputColor();
    inpColor.name = 'stroke';

    let inpColor1 = __createInputColor();
    inpColor1.name = 'fill';
    inpColor1.style.visibility = 'hidden';

    let inpDashed = __createInputCheckbox();
    inpDashed.name = 'dashed';

    let inpWeight = __createInputNumber('1', '30');
    inpWeight.value = '2';
    inpWeight.name = 'weight';

    let vuoto = __createInputCheckbox();
    vuoto.name = 'noFill';
    vuoto.checked = true;

    let sBordo = (action === 'create line' || action.indexOf('spline') !== -1 || action.indexOf(' arc ') !== -1)? 'colore': 'bordo';
    inps.appendChild(__createInp(inpColor, sBordo, 'span'));
    inps.appendChild(__createInp(inpDashed, 'tratteggiato&nbsp;&nbsp;&nbsp;', 'div'));
    inps.appendChild(__createInp(inpWeight, 'spessore', 'span'));
    if(action !== 'create line' && action.indexOf('create spline ') === -1 && action.indexOf(' arc ') === -1) {
        inps.appendChild(__createInp(vuoto, 'trasparente&nbsp;&nbsp;&nbsp;', 'div'));
        inps.appendChild(__createInp(inpColor1, 'colore', 'span'));
        let t = inps.children[4];
        t.style.visibility = 'hidden';

        vuoto.onclick = function() {
            if(t.style.visibility === 'hidden') {
                t.style.visibility = 'visible';
                inpColor1.style.visibility = 'visible';
            } else {
                t.style.visibility = 'hidden';
                inpColor1.style.visibility = 'hidden';
            }
        };
    }
    if(action.indexOf('create pol') !== -1) {
        let inpNumLati = __createInputNumber('3')
        if(elementSelected !== undefined)
            inpNumLati.value = elementSelected.caract.nLati.toString();
        else
            inpNumLati.value = '5';
        inpNumLati.name = 'n-lati';
        inps.appendChild(__createInp(inpNumLati, 'lati', 'span'));
    }
}

//--- (HTMLDivElement) crea l'input completo in base a quello per parametro
//- (HTMLDivElement) inp, input non completo
//- (string) str, name per l'input
//- (string) type, tipo del contenitore in cui verrà messo l'input
function __createInp(inp, str, type) {
    let div = document.createElement('div');
    div.className = 'input-group mb-3';
    let sp = document.createElement(type);
    sp.className = 'input-group-text';
    sp.innerHTML = str;

    div.appendChild(sp);
    if(type === 'div')
        sp.appendChild(inp);
    else
        div.appendChild(inp);

    return div;
}

//--- (void) pulisce il <div> contenenti tutti gli <input>
function clearInputs() {
    let t = document.getElementById('inputs');
    while(t.childElementCount > 0) 
        t.removeChild(t.lastChild);
}

//--- (HTMLDivElement) crea l'<input> con type = 'color'
function __createInputColor() {
    let inpColor = document.createElement('input');
    inpColor.type = 'color';
    inpColor.className = 'form-control form-control-color';
    inpColor.value = '#ffffff';
    return inpColor;
}

//--- (HTMLDivElement) crea l'<input> con type = 'checkbox'
function __createInputCheckbox() {
    let inpCheck = document.createElement('input');
    inpCheck.type = 'checkbox';
    inpCheck.className = 'form-check-input mt-0';
    inpCheck.value = '';
    return inpCheck;
}

//--- (HTMLDivElement) crea l'<input> con type = 'number'
//- (number) min, il numero minimo che può assumere l'input
//- (number | null) max, opzionale ed equivale al numero massimo inseribile
function __createInputNumber(min, max=null) {
    let inp = document.createElement('input');
    inp.type = 'number';
    inp.className = 'form-control form-control-color';
    inp.min = min;
    if(max != null)
        inp.max = max;
    return inp;
}

//--- (HTMLDivElement) crea l'<input> con type = 'text'
//- (RegExp) pattern, è il pattern dell'input.value
function __createInputText(pattern) {
    let inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'form-control';
    inp.pattern = pattern;
    return inp;
}

//--- (void) setta gli input alla partenza della creazione di un oggetto in base al valore di action
function setInputAtStart() {
    setInputs();
    let inps = document.getElementById('inputs');
    let pattern = new RegExp(/[0-9]+\.*[0-9]{0,3}$/);

    if(action.indexOf(' rect ') !== -1 || action === 'create rombo' || action === 'create ellipse') {
        let inpWidth = __createInputText(pattern);
        inpWidth.name = 'width';
        inpWidth.value = '0';
        inps.appendChild(__createInp(inpWidth, 'lunghezza', 'span'));

        let inpHeight = __createInputText(pattern);
        inpHeight.name = 'height';
        inpHeight.value = '0';
        inps.appendChild(__createInp(inpHeight, 'altezza', 'span'));
    } else if(action !== 'create ci 3p') {
        let inpRag = __createInputText(pattern);
        inpRag.name = 'raggio';
        inpRag.value = '0';
        inps.appendChild(__createInp(inpRag,  action === 'create ci diam' || action === 'create ci 2p'? 'diametro': 'raggio', 'span'));
    }

    if(action !== 'create ci 3p')
        setButtonCreate();
}

//--- (void) setta gli input dell'elemento in base all'elemento selezionato
function setInputObjSelected(caract) {
    setInputs();
    let inps = document.getElementById('inputs');
    let pattern = new RegExp(/[0-9]+\.*[0-9]{0,3}$/);

    if(caract.width !== undefined && caract.width != null) {
        let inpWidth = __createInputText(pattern);
        inpWidth.name = 'width';
        inpWidth.value = abs(caract.width).toFixed(3).toString();
        inps.appendChild(__createInp(inpWidth, 'lunghezza', 'span'));
    
        let inpHeight = __createInputText(pattern);
        inpHeight.name = 'height';
        inpHeight.value = abs(caract.height).toFixed(3).toString();
        inps.appendChild(__createInp(inpHeight, 'altezza', 'span'));
    }
    if(caract.diametro !== undefined && caract.diametro != null) {
        let inpRag = __createInputText(pattern);
        inpRag.name = 'raggio';
        inpRag.value = (caract.diametro / 2).toFixed(3).toString();
        inps.appendChild(__createInp(inpRag, 'raggio', 'span'));
    } else if(caract.raggio !== undefined && caract.raggio != null) {
        let inpRag = __createInputText(pattern);
        inpRag.name = 'raggio';
        inpRag.value = caract.raggio.toFixed(3).toString();
        inps.appendChild(__createInp(inpRag, 'raggio', 'span'));
    }

    inps.children[0].children[1].value = caract.colorStroke;
    inps.children[1].children[0].children[0].checked = caract.dashed;
    inps.children[2].children[1].value = caract.weight;
    if (caract.mode !== 'create line' && caract.mode.indexOf(' arc ') === -1 && caract.mode.indexOf(' spline ') === -1) {
        inps.children[3].children[0].children[0].checked = caract.fillColor == null;
        if (caract.fillColor != null) {
            inps.children[4].children[1].value = caract.fillColor;
            inps.children[4].children[1].style.visibility = 'visible';
            inps.children[4].style.visibility = 'visible';
        } else {
            inps.children[4].children[1].style.visibility = 'hidden';
            inps.children[4].style.visibility = 'hidden';
        }
    }

    let inpXMoved = __createInputText(pattern);
    inpXMoved.name = 'xMoved';
    inpXMoved.value = '0.000';
    let inpYMoved = __createInputText(pattern);
    inpYMoved.name = 'yMoved';
    inpYMoved.value = '0.000';

    inps.appendChild(__createInp(inpXMoved, 'X spostata di', 'span'));
    inps.appendChild(__createInp(inpYMoved, 'Y spostata di', 'span'));
    setButtons();
}

//--- (void) aggiunge il <button> create
function setButtonCreate() {
    let b = document.createElement('input');
    b.type = 'submit';
    b.className = 'btn btn-success';
    b.value = 'create';
    b.onclick = setPuntiObjs;
    document.getElementById('inputs').appendChild(b);
}

//--- (void) aggiunge i <button>s apply e delete
function setButtons() {
    let inps = document.getElementById('inputs');
    let divB = document.createElement('div');
    divB.id = 'class-buttons';

    let b1 = document.createElement('input');
    b1.type = 'submit';
    b1.className = 'btn btn-success';
    b1.value = 'apply';
    b1.onclick = applyModify;

    let b2 = document.createElement('input');
    b2.type = 'submit';
    b2.className = 'btn btn-danger';
    b2.value = 'delete';
    b2.onclick = deleteElementSelected;

    divB.appendChild(b1);
    divB.appendChild(b2);
    inps.appendChild(divB);
}

//--- (boolean) ritorna true se un <input> è selezionato
inputIsFocused = () => document.activeElement !== document.getElementsByTagName('body')[0];