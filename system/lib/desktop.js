async function setShortCuts(path='system/shorcuts.json') {
    shortcuts = JSON.parse(await webfs.getFileContents(path));
    console.log(shortcuts)
    for (let shortcut of shortcuts) {
        let div = document.createElement('div');
        div.innerHTML = `
        <div class="package" onclick="startApp('apps/${shortcut.application}', params={path: '${shortcut.path}'})">
            <img src="${shortcut.icon}">
            <p>${shortcut.name}</p>
        </div>`;
        document.getElementById(vfs.vmem.glts).append(div);
    }
}
function setApps() {
    for (let app of vfs.applications) {
        if (app.show) {
            let div = document.createElement('div');
            params = '';
            if ('params' in app) {
                params = `, ${app.params}`;
            }
            div.innerHTML = `
            <div class="package" onclick="startApp('${app.path}'${params})">
                <img src="${app.icon}">
                <p>${app.name}</p>
            </div>`;
            document.getElementById(vfs.vmem.glts).append(div);
        }
    }
    setShortCuts();
}
function setWallpaper(path) {
    document.getElementById(vfs.vmem.glct).style.backgroundImage = `url('${path}')`;
}
async function screenInit() {
    vfs.vmem.taskbar = true;
    vfs.vmem.screen = getScreen();
    window.onresize = function() { vfs.vmem.screen = getScreen(); }
    window.onerror = async function(e) { err = e; await kernel.handleError(e); }
    kernel.createThread('date-update-service', () => {
        date = getDate();
        document.getElementById('dateplace').innerHTML = `${date['hours']}:${date['minutes']}:${date['seconds']}`;
    }, important=true, onclose = () => {

    });
    if (localStorage.wallpaper) {
        try {
            file = await webfs.getFile(localStorage.wallpaper)
            setWallpaper(file.contents);
        }
        catch {}
    }
    else { setWallpaper(vfs.vmem.wallpaper); }
    setApps();
    showScreen();
}
function getPosition(e) {
    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;
    
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
        x: posx,
        y: posy
    }
}
function clickInsideElement( e, className ) {
    var el = e.srcElement || e.target;
    
    if ( el.classList.contains(className) ) {
        return el;
    }
    else {
        while ( el = el.parentNode ) {
            if ( el.classList && el.classList.contains(className) ) {
                return el;
            }
        }
    }
    return false;
}
function clickListener(type, id=false) {
    document.addEventListener( "click", function(e) {
        if (id) { var clickeElIsLink = clickInsideElement( e, id ); }
        else { var clickeElIsLink = clickInsideElement( e, 'contextmenu' ); }

        if ( clickeElIsLink ) {
            // e.preventDefault();
        }
        else {
            var button = e.which || e.button;
            if ( button === 1 ) {
                if (type == 'context') { removeContextMenu(); }
                if (type == 'inmenu') { console.log('sex'); /*removeInMenu();*/ }
            }
        }
    });
}
function spawnContextMenu(e, object) {
    if (!document.querySelector('.contextmenu')) {
        var menu = document.createElement('div');
        menu.setAttribute('class', 'contextmenu');
    }
    else { var menu = document.querySelector('.contextmenu'); }
    toSpawn = '';
    for (let elem of object) {
        if (elem.rem) { elem.action = 'removeContextMenu();' + elem.action; }
        if (elem.label) { toSpawn += `<label for="${elem.for}" onclick="${elem.action}">${elem.name}</label>`; }
        else { toSpawn += `<button onclick="removeContextMenu(); ${elem.action}">${elem.name}</button>` }
    }
    menu.innerHTML = toSpawn;

    clickCoords = getPosition(e);
    clickCoordsX = clickCoords.x;
    clickCoordsY = clickCoords.y;

    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    menu.style.zIndex = windowindexes;

    if ( (windowWidth - clickCoordsX) < menuWidth ) {
        menu.style.left = windowWidth - menuWidth + "px";
    }
    else {
        menu.style.left = clickCoordsX + "px";
    }

    if ( (windowHeight - clickCoordsY) < menuHeight ) {
        menu.style.top = windowHeight - menuHeight + "px";
    }
    else {
        menu.style.top = clickCoordsY + "px";
    }
    clickListener('context');

    document.body.appendChild(menu);
}
function spawnInMenu(id) {
    actmenu = vfs.vmem.activeinmenu;
    if (actmenu) {
        document.getElementById(actmenu + '_btn').removeAttribute('selected');
        document.getElementById(actmenu).setAttribute('hidden', '');
        vfs.vmem.activeinmenu = false;
    }
    if (actmenu != id) {
        document.getElementById(id + '_btn').setAttribute('selected', '');
        document.getElementById(id).removeAttribute('hidden');
        vfs.vmem.activeinmenu = id;
    }
}
function removeInMenu() {
    actmenu = vfs.vmem.activeinmenu;
    if (actmenu) {
        document.getElementById(actmenu + '_btn').removeAttribute('selected');
        document.getElementById(actmenu).setAttribute('hidden', '');
        vfs.vmem.activeinmenu = false;
    }
}
function executeMemBlock(hash, index=0) {
    eval(vfs.vmem.svcache[hash + '_memblock'][index]);
    removeInMenu();
}
function generateHash() {
    return (Math.random() + 1).toString(36).substring(2);
}
function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}
function removeContextMenu() {
    if (document.querySelector('.contextmenu')) {
        document.querySelector('.contextmenu').remove();
    }
}
function loadScript(path) {
    fetch(path, { method: 'GET' })
    .then(script => script.text())
    .then(script => {
        eval(script);
    });
}

window.onload = function () {
    fetch('system/vfs.json', {
        method: 'GET',
    })
    .then(res => res.json())
    .then(res => {
        vfs = res;
        screenInit();
    });
}
