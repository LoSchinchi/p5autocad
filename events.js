let nTimePressed = 0;
let precX, precY;
let xStart, yStart;

function mouseWheel(event) {
    /*if(mouseX > width || mouseY > height || mouseY < 0 || mouseX < 0)
        return

    scala += (event.delta < 0 ? .2 : -.2)
    scala = min([10, scala]);
    scala = max([scala, 0.2]);

    for(let p of punti) {
        p.x = p.xzoom * scala;
        p.y = p.yzoom * scala;
    }*/
}
function setMousePressed() {
    if (menuOpened)
        return;

    if(mouseIsPressed && mouseButton === 'left' && elementSelected !== undefined && (elementSelected.collide() || nTimePressed >= 5) && !inCreation && !isMuoviCanva) {
        if(nTimePressed < 5) {
            nTimePressed++;
            xStart = mouseX;
            yStart = mouseY;
            //puntiElSelected = JSON.parse(JSON.stringify(elementSelected.punti))
        } else {
            cursor('grab');
            let addX = int((mouseX - xStart) / scala);
            let addY = int((yStart - mouseY) / scala);
            document.getElementsByName('xMoved')[0].value = (addX / SCALA_1_CM).toFixed(3).toString();
            document.getElementsByName('yMoved')[0].value = (addY / SCALA_1_CM).toFixed(3).toString();
        }
    } else if(mouseIsPressed && (mouseButton === 'center' || isMuoviCanva)) {
        if(nTimePressed < 5)
            nTimePressed++;
        else {
            cursor('grab');
            greenLineX += (mouseX - precX) / scala;
            redLineY += (mouseY - precY) / scala;
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
            puntiElSelected = JSON.parse(JSON.stringify(elementSelected.punti));
            setInputObjSelected(elementSelected.caract);
            action = null;
        } else if(action != null) {
            cursor('crosshair');
            if (action === 'create ci raggio' || action === 'create rect 2p' || action === 'create rect ce' ||
                action === 'create ci diam' || action === 'create ci 2p' || action === 'create pol insc' ||
                action === 'create pol circ' || action === 'create ellipse' || action === 'create rombo')
                setObjPunti(mouseX, mouseY, 2);
            else if (action === 'create rect 3p' || action === 'create ci 3p' || action === 'create arc 3p' || action === 'create arc ce 1p')
                setObjPunti(mouseX, mouseY, 3);
            else if (action === 'create line' || action === 'create spline adapted' || action === 'create spline p contr')
                setObjPunti(mouseX, mouseY, -1);
        }

        setTimeout(() => {
            if(!mouseIsPressed)
                nTimePressed = 0;
            }, 200);
    }
}

function keyPressed(event) {
    if(saveAs)
        return;
    setLines();
    if(event.key === 'Escape') {
        isMuoviCanva = false;
        puntiPerObjs = [];
        inCreation = false;
        clearInputs();
        action = null;

        if(elementSelected !== undefined) {
            elementSelected.caract = JSON.parse(JSON.stringify(caractsElSeletced));
            //console.log('que: ', elementSelected.punti, puntiElSelected);
            //elementSelected.punti = puntiElSelecteds;
        }

        elementSelected = undefined;
        caractsElSeletced = undefined;
        puntiElSelected = undefined;
    } else if(event.key === 'Enter' && elementSelected !== undefined)
        applyModify();
    else if(event.key === 'Delete' && elementSelected !== undefined && !inputIsFocused())
        deleteElementSelected();


    if(event.key === 'a')
        action = 'create line';
    else if(event.key === 's')
        action = 'create ci raggio';
    else if(event.key === 'd')
        action = 'create rect 2p';
    else if(event.key === 'f')
        action = 'create rect 3p';
    else if(event.key === 'g')
        action = 'create rect ce';
    else if(event.key === 'h')
        action = 'create ci diam';
    else if(event.key === 'b')
        action = 'create ci 2p';
    else if(event.key === 'n')
        action = 'create ci 3p';
    else if(event.key === 'o')
        action = 'create arc 3p';
    else if(event.key === 'p')
        action = 'create arc ce 1p';
    else if(event.key === 'q')
        action = 'create pol insc';
    else if(event.key === 'w')
        action = 'create pol circ';
    else if(event.key === 'e')
        action = 'create spline adapted';
    else if(event.key === 'r')
        action = 'create spline p contr';
    else if (event.key === 't')
        action = 'create ellipse';
    else if (event.key === 'y')
        action = 'create rombo';
    else if (event.key === 'm')
        isMuoviCanva = !isMuoviCanva
}