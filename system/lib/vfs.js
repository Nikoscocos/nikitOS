const weekdays = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday"
}
function formatTime(seconds) {
    minutes = Math.floor(seconds / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return minutes + ":" + seconds;
}
function getFF(value, by='ext') {
    if (by == 'ext') { return vfs.fileformats.find(o => o.ext.indexOf(value) != -1 ); }
    else if (by == 'name') { return vfs.fileformats.find(o => o.name.indexOf(value) != -1); }
}
function getOpenWith(ext) {
    try { return getFF(ext)['openwith']; }
    catch { return vfs.fileformats.find(o => o.ext === '*')['openwith']; }
}
function saveKey(key, value, toeval=null) {
    fetch('/savekey', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"key": key, "value": value})
    })
    .then(res => { if (toeval) { eval(toeval); } })
}