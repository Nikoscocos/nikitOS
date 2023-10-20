a = 1
ttwin.setAttribute('readonly', '');
​
setInterval(() => {
    ttwin.value += `\nGetting server information... [${a}]`
    a++;
    tCursorToEnd(ttwin.getAttribute('id'))
}, 50)
