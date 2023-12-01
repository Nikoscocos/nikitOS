function getStorage() {
    return JSON.parse(localStorage.webfs);
}
function saveStorage(object) {
    localStorage.webfs = JSON.stringify(object);
}
function webfsInit() {
    timestamp = new Date();
    webfs = {
        name: "webFS",
        createDate: timestamp,
        root: {
            files: [],
            map: [],
            cache: {}
        }
    }
    saveStorage(webfs);
}
function getListDir(directory=false, cwd=false) {
    if (cwd) { directory = cwd + '/' + directory; }
    storage = getStorage();
    dir = {dirs: [], files: []};
    curdir = false;
    if (!directory) {
        for (let file of storage.root.files) {
            if (file.isdir) { dir.dirs.push({isdir: file.isdir, name: file.name, hash: file.hash, metadata: file.metadata, path: directory + '/' + file.name, create: file.createDate}) }
            else { dir.files.push({isdir: file.isdir, name: file.name, hash: file.hash, metadata: file.metadata, path: directory + '/' + file.name, create: file.createDate}) }
        }
    }
    else {
        for (let dirq of directory.split('/')) {
            if (!curdir) { founddir = storage.root.files.find(o => o.name === dirq && o.isdir); }
            else { founddir = curdir.files.find(o => o.name === dirq && o.isdir); }
            curdir = founddir;
        }
        for (let file of curdir.files) {
            if (file.isdir) { dir.dirs.push({isdir: file.isdir, name: file.name, hash: file.hash, metadata: file.metadata, path: directory + '/' + file.name, create: file.createDate}) }
            else { dir.files.push({isdir: file.isdir, name: file.name, hash: file.hash, metadata: file.metadata, path: directory + '/' + file.name, create: file.createDate}) }
        }
    }
    return dir;
}
function getFile(directory, decode=false) {
    storage = getStorage();
    curdir = false;
    file = false;
    filesq = directory.split('/');
    counter = 0;
    if (filesq && directory.includes('/')) {
        for (let dirq of filesq) {
            counter++;
            if (counter != filesq.length) {
                if (!curdir) { founddir = storage.root.files.find(o => o.name === dirq && o.isdir); }
                else { founddir = curdir.files.find(o => o.name === dirq && o.isdir); }
                curdir = founddir;
            }
            else {
                file = curdir.files.find(o => o.name === dirq && !o.isdir);
                file.path = directory;
            }
        }
    }
    else {
        file = storage.root.files.find(o => o.name === directory && !o.isdir);
        file.path = directory;
        if (decode) { file.contents = Base64.decode(file.contents); }
    }
    return file;
}
function openFile(directory, metadata={}) {
    storage = getStorage();
    curdir = false;
    file = false;
    filesq = directory.split('/');
    counter = 0;
    if (filesq && directory.includes('/')) {
        for (let dirq of filesq) {
            counter++;
            if (counter != filesq.length) {
                if (!curdir) { founddir = storage.root.files.find(o => o.name === dirq && o.isdir); }
                else { founddir = curdir.files.find(o => o.name === dirq && o.isdir); }
                curdir = founddir;
            }
            else {
                curdir.files.push({
                    isdir: false,
                    name: dirq,
                    createDate: new Date(),
                    metadata: metadata,
                    hash: (Math.random() + 1).toString(36).substring(2),
                    contents: ''
                })
            }
        }
    }
    else {
        file = storage.root.files.push({
            isdir: false,
            name: directory,
            createDate: new Date(),
            metadata: metadata,
            hash: (Math.random() + 1).toString(36).substring(2),
            contents: ''
        })
    }
    saveStorage(storage);
}
function makeDirectory(directory, metadata={}) {
    storage = getStorage();
    curdir = false;
    file = false;
    filesq = directory.split('/');
    counter = 0;
    if (filesq && directory.includes('/')) {
        for (let dirq of filesq) {
            counter++;
            if (counter != filesq.length) {
                if (!curdir) { founddir = storage.root.files.find(o => o.name === dirq && o.isdir); }
                else { founddir = curdir.files.find(o => o.name === dirq && o.isdir); }
                curdir = founddir;
            }
            else {
                curdir.files.push({
                    isdir: true,
                    name: dirq,
                    createDate: new Date(),
                    metadata: metadata,
                    hash: (Math.random() + 1).toString(36).substring(2),
                    files: []
                })
            }
        }
    }
    else {
        file = storage.root.files.push({
            isdir: true,
            name: directory,
            createDate: new Date(),
            metadata: metadata,
            hash: (Math.random() + 1).toString(36).substring(2),
            files: []
        })
    }
    saveStorage(storage);
}
function writeToFile(directory, content, mode='w') {
    storage = getStorage();
    curdir = false;
    file = false;
    filesq = directory.split('/');
    counter = 0;
    write = Base64.encode(content);
    if (filesq && directory.includes('/')) {
        for (let dirq of filesq) {
            counter++;
            if (counter != filesq.length) {
                if (!curdir) { founddir = storage.root.files.find(o => o.name === dirq && o.isdir); }
                else { founddir = curdir.files.find(o => o.name === dirq && o.isdir); }
                curdir = founddir;
            }
            else {
                file = curdir.files.find(o => o.name === dirq && !o.isdir);
                file.contents = write;
            }
        }
    }
    else {
        file = storage.root.files.find(o => o.name === directory && !o.isdir);
        file.contents = write;
    }
    saveStorage(storage);
}