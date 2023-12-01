function showNotification(icon, title, text, timeout=7, sound='/system/snd/Submarine.mp3', playsound=true) {
    taskbar = document.getElementById('taskbar');
    audio = new Audio(sound);
    template = `
    <img icon src="${icon}">
    <div textareaq>
        <p title>${title}</p>
        <p textall>${text}</p>
    </div>
    `;
    target = document.getElementById('nots');
    thistarget = document.getElementById('innots');
    thistarget.innerHTML = template;
    target.style.right = '0px';
    target.style.float = 'right';
    if (playsound) { audio.play(); }
    setTimeout(() => {
        target.style.right = '-100%';
    }, timeout * 1000)
}