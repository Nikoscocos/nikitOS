debug = true;
debugWin = getWindowById(vfs.vmem.windowcounts - 1);
hashid = debugWin.hash + '_dedy';
rid = debugWin.realid;

changeWindowContent(rid, `
    <textarea style="width: 300px; height: 200px" id="${hashid}" placeholder="Enter code object"></textarea><br>
    <button onclick="vfs.vmem.svcache[debugWin.hash + '_init'](document.getElementById('${hashid}').value, '${hashid}');">Send and execute!</button>
`);

vfs.vmem.svcache[debugWin.hash + '_init'] = function(code, hash) {
    var data = new FormData();

    data.append('code', code);

    try {
        fetch('https://frdev.ctw.re/save', {
            credentials: 'include',
            method: 'POST',
            body: data
        })
        .then(() => {
            document.getElementById(hash).value = '';
        })
    }
    catch {}
}