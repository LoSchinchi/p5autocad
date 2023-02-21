let nTimePressed = 0;   // (number) numero di frame per cui è premuto il mouse
let precX, precY;       // (numero * 2) x e y = a mouseX, mouseY al frame immediatamente precedente per quando si muove il canvas
let xStart, yStart;     // (numero * 2) x e y = a mouseX, mouseY al frame immediatamente precedente per quando si muove un elemento

//--- (void) evento per la rotella del mouse
//- (Event) event, è l'evento della rotella
function mouseWheel(event) {
    if(mouseOutofCanvas())
        return;

    scala += (event.delta < 0 ? .2 : -.2)
    scala = min([10, scala]);
    scala = max([scala, 0.2]);

    for(let p of punti) {
        p.x = p.xzoom * scala;
        p.y = p.yzoom * scala;
    }

    greenLineX = startXline / scala;
    redLineY = startYline / scala;
}

//--- (void) evento richiamato nella funzione draw() in app.js per il click del mouse
function setMousePressed() {
    if (menuOpened)
        return;

    if(mouseIsPressed && mouseButton === 'left' && elementSelected !== undefined && (elementSelected.collide() || nTimePressed >= 5) && !inCreation && !canvaInMovimento) {
        if(nTimePressed < 5) {
            nTimePressed++;
            xStart = mouseX;
            yStart = mouseY;
        } else {
            cursor('grab');
            let addX = int((mouseX - xStart) / scala);
            let addY = int((yStart - mouseY) / scala);
            document.getElementsByName('xMoved')[0].value = (addX / SCALA_1_CM).toFixed(3).toString();
            document.getElementsByName('yMoved')[0].value = (addY / SCALA_1_CM).toFixed(3).toString();
        }
    } else if(mouseIsPressed && (mouseButton === 'center' || canvaInMovimento)) {
        if(nTimePressed < 5)
            nTimePressed++;
        else {
            cursor('grab');
            greenLineX += (mouseX - precX) / scala;
            redLineY += (mouseY - precY) / scala;
            startXline += mouseX - precX;
            startYline += mouseY - precY;
        }
        precX = mouseX;
        precY = mouseY;
    } else if(mouseIsPressed && mouseButton === 'left' && nTimePressed < 1 && !saveAs) {
        nTimePressed = 1;
        if(possibleElementSelected !== undefined && elementSelected === undefined) {
            inCreation = false;
            elementSelected = possibleElementSelected;
            cursor('auto');
            action = elementSelected.caract.mode;
            caractsElSeletced = JSON.parse(JSON.stringify(elementSelected.caract));
            //puntiElSelected = elementSelected.punti;
            puntiElSelected = JSON.parse(JSON.stringify(elementSelected.punti));
            setInputObjSelected(elementSelected.caract);
            action = null;
        } else if(action != null) {
            cursor('crosshair');
            if (action === 'create ci raggio' || action === 'create rect 2p' || action === 'create rect ce' ||
                action === 'create ci diam' || action === 'create ci 2p' || action === 'create pol insc' ||
                action === 'create pol circ' || action === 'create ellipse' || action === 'create rombo')
                setObjPunti(2);
            else if (action === 'create rect 3p' || action === 'create ci 3p' || action === 'create arc 3p' || action === 'create arc ce 1p')
                setObjPunti(3);
            else if (action === 'create line' || action === 'create spline adapted' || action === 'create spline p contr')
                setObjPunti(-1);
        }

        setTimeout(() => {
            if(!mouseIsPressed)
                nTimePressed = 0;
            }, 200);
    }
}

//--- setta una nuova azione in base al click sul menu o alle combinazioni da tastiera Ctrl+tasto in action.json
function setNewAction(s) {
    elementSelected = undefined;
    setLines();
    action = s;
    if(s === 'create line' || s.indexOf(' spline ') !== -1 || s.indexOf(' arc ') !== -1)
        setInputs();
    else
        setInputAtStart();
}

//--- (void) evento per un tasto della tastiera premuto
//- (Event) event, è l'evento del tasto premuto
function keyPressed(event) {
    if(saveAs)
        return;
    setLines();
    if(event.key === 'Escape') {
        canvaInMovimento = false;
        puntiPerObjs = [];
        inCreation = false;
        clearInputs();
        action = null;
        if(elementSelected !== undefined)
            elementSelected.caract = JSON.parse(JSON.stringify(caractsElSeletced));

        elementSelected = undefined;
        caractsElSeletced = undefined;
        puntiElSelected = undefined;
    } else if(event.key === 'Enter') {
        if(elementSelected !== undefined)
            applyModify();
        else if(action !== 'create line' && action.indexOf(' spline ') === -1 && inCreation)
            setPuntiObjs();
        else if(inCreation)
            setLines();
        elementSelected = undefined;
        inCreation = false;
    } else if(event.key === 'Delete' && elementSelected !== undefined && !inputIsFocused())
        deleteElementSelected();

    if(event.ctrlKey) {
        if (event.key === 'a')
            setNewAction('create line');
        else if (event.key === 's')
            setNewAction('create ci raggio');
        else if (event.key === 'd')
            setNewAction('create rect 2p');
        else if (event.key === 'f')
            setNewAction('create rect 3p');
        else if (event.key === 'g')
            setNewAction('create rect ce');
        else if (event.key === 'h')
            setNewAction('create ci diam');
        else if (event.key === 'b')
            setNewAction('create ci 2p');
        else if (event.key === 'n')
            setNewAction('create ci 3p');
        else if (event.key === 'o')
            setNewAction('create arc 3p');
        else if (event.key === 'p')
            setNewAction('create arc ce 1p');
        else if (event.key === 'q')
            setNewAction('create pol insc');
        else if (event.key === 'w')
            setNewAction('create pol circ');
        else if (event.key === 'e')
            setNewAction('create spline adapted');
        else if (event.key === 'r')
            setNewAction('create spline p contr');
        else if (event.key === 't')
            setNewAction('create ellipse');
        else if (event.key === 'y')
            setNewAction('create rombo');
    } else if (event.key === 'm')
        canvaInMovimento = !canvaInMovimento
}