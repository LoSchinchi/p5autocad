let menuOpened = false;
let saveAs = false, nameProject = undefined;

addEventListener('load', function() {
    for (let a = 0; a < 5; a ++) {
        let dropdown = document.getElementById('dropdown_' + a.toString());
        
        dropdown.addEventListener('show.bs.dropdown', function() {    
            menuOpened = true;
        });
        dropdown.addEventListener('hidden.bs.dropdown', function() {
            menuOpened = false;
        });
    }
});

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
    let btn4 = document.createElement('button');
    btn4.innerHTML = 'adatta';
    btn4.onclick = adaptCanvas;
    let btn5 = document.getElementById('salva-come');
    btn5.onclick = setSaveAs;
    let btn6 = document.getElementById('carica');
    btn6.onclick = setMenuCarica;
    let btn7 = document.createElement('button');
    btn7.innerHTML = 'muovi';
    btn7.onclick = () => isMuoviCanva = !isMuoviCanva;

    buttons.appendChild(btn1);
    buttons.appendChild(btn2);
    buttons.appendChild(btn3);
    buttons.appendChild(btn4);
    buttons.appendChild(btn5);
    buttons.appendChild(btn6);
    buttons.appendChild(btn7);
    body.appendChild(buttons);

    //document.getElementsByTagName('nav')[0].style.width = (windowWidth - 495).toString() + 'px';
}

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
    p.style.maxWidth = '50%';
    p.style.overflow = 'auto';
    div.insertBefore(p, div.firstChild);

    let btn1 = document.createElement('button');
    btn1.className = 'btn btn-danger';
    btn1.innerHTML = 'ELimina';
    btn1.onclick = function() {
        console.log(tit);
        localStorage.removeItem(tit);
        console.log(localStorage.getItem(tit));
        setMenuCarica();
    };
    let btn2 = document.createElement('button');
    btn2.className = 'btn btn-success';
    btn2.innerHTML = 'Carica';
    btn2.onclick = function() {
        let el = JSON.parse(localStorage.getItem(tit));
        /*console.log('el:', el);
        linee = [];
        for(let _line of el.linee) {
            let __l = new Line([new Punto(0, 0), new Punto(0, 0)]);
            __l.punti = _line.punti;
            __l.caract = _line.caract;
            linee.push(__l);
        }*/
        /*linee = [...el.linee];

        objs = [];
        for(let __el of [...el.objs])
            objs.push(__el);*/
        /*
        punti = [];
        punti.push(new Punto(0, 0, false));
        for(let __el of [...el.punti])
            punti.push(new Punto(__el.x, __el.y, false));*/
        /*__setArr(punti, el.punti);
        arcs = el.archi;
        splines = el.splines;
        console.log('objs: ', objs)
        console.log('punti: ', punti)*/
    };
    div.appendChild(btn1);
    div.appendChild(btn2);
}

function __setArr(a1, a2) {
    a1 = [];
    console.log('a2: ', a2)
    for(let el of a2) {
        console.log('el: ', el);
        a1.push({...el});
    }
}

function setSaveAs() {
    let d = new Date();
    let d1 = d.toDateString() + ' ' + d.toTimeString().split(' ')[0];
    document.getElementById('nome-save').value = 'project_' + d1.split(' ').join('_');
    saveAs = true;
}

function onSaveAs() {
    let title = document.getElementById('nome-save').value;
    if(localStorage.getItem(title) == null) {
        console.log('punti --> ', punti);
        localStorage.setItem(title, JSON.stringify({
            "linee": linee,
            "archi": arcs,
            "objs": objs,
            "splines": splines,
            "punti": punti
        }));
        saveAs = false;
        nameProject = title;
        setDoubleButton();
    } else
        alert('progetto ' + title + ' già presente');
}

function onSave() {
    localStorage.setItem(nameProject, JSON.stringify({
        "linee": linee,
        "archi": arcs,
        "objs": objs,
        "splines": splines,
        "punti": punti
    }));
}

function setDoubleButton() {
    let buttons = document.getElementById('buttons');

    let div = document.createElement('div');
    div.className = 'btn-group';
    div.ariaRoleDescription = 'group';
    div.ariaLabel = 'Basic example';
    let btn1 = document.createElement('button');
    btn1.onclick = setSaveAs;
    btn1.innerHTML = 'salva come';
    let btn2 = document.createElement('button');
    btn2.onclick = onSave;
    btn2.innerHTML = 'salva';
    div.appendChild(buttons.children[4]);
    div.appendChild(btn2);

    buttons.appendChild(div);
    let btn6 = document.getElementById('carica');
    btn6.onclick = setMenuCarica;
    buttons.appendChild(btn6)
}

function setNewAction(event, s) {
    elementSelected = undefined;
    setLines();
    action = s;
    setInputs();
}

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

function clearInputs() {
    let t = document.getElementById('inputs');
    while(t.childElementCount > 0) 
        t.removeChild(t.lastChild);
}

function __createInputColor() {
    let inpColor = document.createElement('input');
    inpColor.type = 'color';
    inpColor.className = 'form-control form-control-color';
    inpColor.value = '#ffffff';
    return inpColor;
}
function __createInputCheckbox() {
    let inpCheck = document.createElement('input');
    inpCheck.type = 'checkbox';
    inpCheck.className = 'form-check-input mt-0';
    inpCheck.value = '';
    return inpCheck;
}
function __createInputNumber(min, max=null) {
    let inp = document.createElement('input');
    inp.type = 'number';
    inp.className = 'form-control form-control-color';
    inp.min = min;
    if(max != null)
        inp.max = max;
    return inp;
}
function __createInputText(pattern) {
    let inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'form-control';
    inp.pattern = pattern;
    return inp;
}
function setInputObjSelected(caract) {
    setInputs();
    let inps = document.getElementById('inputs');
    let pattern = new RegExp(/[0-9]+\.*[0-9]{0,3}$/);

    if(caract.width !== undefined && caract.width != null) {
        let inpWidth = __createInputText(pattern);
        inpWidth.name = 'width';
        inpWidth.value = abs(caract.width).toFixed(3).toString();
        inps.appendChild(__createInp(inpWidth, 'lunghezza', 'span'));
    }
    if(caract.height !== undefined && caract.height != null) {
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

function inputIsFocused() {
    return document.activeElement !== document.getElementsByTagName('body')[0];
}