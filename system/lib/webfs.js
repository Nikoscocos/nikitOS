/*
    
    Стандарты метаданных:

    description: str - Описание файла
    author: str - Автор файла
    displayName: str - Отображаемое название файла
    createdAt: str - В какой программе создано
    icon: blobURL, URL - Иконка файла (по стандарту просто файл)
    canOpenIt: array - Список приложений, которые могут открыть этот файл

*/

SimpleIDB.initialize();

var webfs = {
    getSize: async function(length) {
        var i = 0, type = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        while((length / 1000 | 0) && i < type.length - 1) {
            length /= 1024;
            i++;
        }
        return length.toFixed(2) + ' ' + type[i];
    },
    getInfo: async function() {
        storage = await webfs.getStorage();
        realsize = 0;
        fullsize = 0;
        keys = await SimpleIDB.getAll();
        for (let key of keys) {
            contents = await SimpleIDB.get(key);
            sizeof = (contents.length / 3) * 2
            fullsize += parseInt(sizeof);
            realsize += contents.length;
        }
        information = {
            sizes: {
                virtual: {
                    fullsize: fullsize,
                    formatsize: await webfs.getSize(fullsize)
                },
                real: {
                    fullsize: realsize,
                    formatsize: await webfs.getSize(realsize)
                }
            },
            files: keys.length,
            create: storage.createDate
        }
        return information;
    },
    getFileSize: async function(hash) {
        contents = await SimpleIDB.get(hash);
        try {
            sizeof = (contents.length / 3) * 2
            formatsize = await webfs.getSize(sizeof);
        }
        catch { formatsize = '0 B'; }
        return formatsize;
    },
    getStorage: async function() {
        return JSON.parse(await SimpleIDB.get('data'));
    },
    saveStorage: async function(object) {
        await SimpleIDB.set('data', JSON.stringify(object));
    },
    loadFileSystem: async function() {
        div = document.createElement('input');
        div.setAttribute('id', 'uploadFsFile');
        div.setAttribute('type', 'file');
        div.style.display = 'none';
        document.body.appendChild(div);
        document.getElementById('uploadFsFile').click();
        div.addEventListener('change', () => {
            var file = document.getElementById("uploadFsFile").files[0];
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    SimpleIDB.set('filestore', JSON.stringify({}));
                    result = evt.target.result;
                    data = JSON.parse(result);
                    Object.keys(data).map((key) => {
                        if (key == 'data') {
                            parsed = JSON.parse(data[key]);
                            webfs.saveStorage(parsed); 
                        }
                        else { webfs.setFile(key, data[key]); }
                    });
                }
                reader.onerror = function (evt) {
                    console.warn('webFS: Error read data');
                }
            }
        });
    },
    saveFileSystem: function() {
        request = indexedDB.open('myDatabase');
        request.onsuccess = function() {
            db = request.result;
            transaction = db.transaction('myStore', 'readonly');
            objectStore = transaction.objectStore('myStore');
            if ('getAll' in objectStore) {
                keyNames = [];
                keyValues = [];
                objectStore.getAllKeys().onsuccess = function(event) {
                    keyNames = event.target.result;
                    objectStore.getAll().onsuccess = function(event) {
                        assets = {};
                        keyValues = event.target.result;
                        counts = 0
                        for (let obj of keyNames) {
                            assets[obj] = keyValues[counts];
                            counts++;
                        }
                        var encoded = btoa(JSON.stringify(assets));
                        webfs.downloadBase64File(encoded, 'fs.json');
                    };
                };
            }
        }
    },
    saveFile: async function(directory) {
        file = await webfs.getFile(directory);
        webfs.downloadBase64File(file.contents, file.name);
    },
    setFile: async function(hash, base64) {
        await SimpleIDB.set(hash, base64);
    },
    getFileStore: async function(hash) {
        fileto = await SimpleIDB.get(hash);
        return fileto;
    },
    remFileStore: async function(hash) {
        await SimpleIDB.remove(hash);
    },
    webfsInit: async function() {
        timestamp = new Date();
        qwebfs = {
            name: "webFS",
            createDate: timestamp,
            root: {
                files: [],
                map: [],
                cache: {}
            }
        }
        webfs.saveStorage(qwebfs);
        await SimpleIDB.set('filestore', JSON.stringify({}));
    },
    getListDir: async function(directory=false, cwd=false) {
        if (cwd) { directory = cwd + '/' + directory; }
        storage = await webfs.getStorage();
        dir = {dirs: [], files: []};
        curdir = false;
        if (!directory || directory == '/') {
            for (let file of storage.root.files) {
                if (file.isdir) { dir.dirs.push({isdir: file.isdir, name: file.name, hash: file.hash, metadata: file.metadata, path: file.name, create: file.createDate, count: file.files.length}) }
                else { dir.files.push({isdir: file.isdir, name: file.name, hash: file.hash, metadata: file.metadata, path: file.name, create: file.createDate}) }
            }
        }
        else {
            for (let dirq of directory.split('/')) {
                if (!curdir) { founddir = storage.root.files.find(o => o.name === dirq && o.isdir); }
                else { founddir = curdir.files.find(o => o.name === dirq && o.isdir); }
                curdir = founddir;
            }
            for (let file of curdir.files) {
                if (file.isdir) { dir.dirs.push({isdir: file.isdir, name: file.name, hash: file.hash, metadata: file.metadata, path: directory + '/' + file.name, create: file.createDate, count: file.files.length}) }
                else { dir.files.push({isdir: file.isdir, name: file.name, hash: file.hash, metadata: file.metadata, path: directory + '/' + file.name, create: file.createDate}) }
            }
        }
        return dir;
    },
    getFile: async function(directory, decode=false) {
        storage = await webfs.getStorage();
        curdir = false;
        file = false;
        filesq = directory.split('/');
        counter = 0;
        if (filesq && directory.includes('/')) {
            for (let dirq of filesq) {
                counter++;
                if (counter != filesq.length) {
                    if (!curdir) { founddir = await storage.root.files.find(o => o.name === dirq && o.isdir); }
                    else { founddir = await curdir.files.find(o => o.name === dirq && o.isdir); }
                    curdir = founddir;
                }
                else {
                    file = await curdir.files.find(o => o.name === dirq && !o.isdir);
                    file.path = directory;
                    if (decode) { file.contents = await Base64.decode(await webfs.getFileStore(file.hash)); }
                    else { file.contents = await webfs.getFileStore(file.hash); }
                }
            }
        }
        else {
            file = await storage.root.files.find(o => o.name === directory && !o.isdir);
            file.path = directory;
            if (decode) { file.contents = await Base64.decode(await webfs.getFileStore(file.hash)); }
            else { file.contents = await webfs.getFileStore(file.hash); }
        }
        return file;
    },
    writeFileContents: async function(directory, data) {
        conv = 'data:application/octet-stream;base64,' + btoa(data);
        await webfs.writeToFile(directory, conv, encode=false);
    },
    getFileContents: async function(directory) {
        read = await webfs.getFile(directory);
        try {
            if (read.contents.includes('base64,')) {
                contents = atob(read.contents.split('base64,')[1]);
            }
            else {
                contents = atob(read.contents);
            }
        }
        catch { contents = ''; }
        return contents
    },
    openFile: async function(directory, metadata={}) {
        storage = await webfs.getStorage();
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
                        hash: (Math.random() + 1).toString(36).substring(2)
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
                hash: (Math.random() + 1).toString(36).substring(2)
            })
        }
        webfs.saveStorage(storage);
    },
    makeDirectory: async function(directory, metadata={}) {
        storage = await webfs.getStorage();
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
        webfs.saveStorage(storage);
    },
    writeToFile: async function(directory, content, encode=true) {
        storage = await webfs.getStorage();
        curdir = false;
        file = false;
        filesq = directory.split('/');
        counter = 0;
        if (encode) { write = await Base64.encode(content); }
        else { write = content; }
        if (filesq && directory.includes('/')) {
            for (let dirq of filesq) {
                counter++;
                if (counter != filesq.length) {
                    if (!curdir) { founddir = await storage.root.files.find(o => o.name === dirq && o.isdir); }
                    else { founddir = await curdir.files.find(o => o.name === dirq && o.isdir); }
                    curdir = founddir;
                }
                else {
                    file = await curdir.files.find(o => o.name === dirq && !o.isdir);
                    await webfs.setFile(file.hash, write);
                }
            }
        }
        else {
            file = await storage.root.files.find(o => o.name === directory && !o.isdir);
            await webfs.setFile(file.hash, write);
        }
        await webfs.saveStorage(storage);
    },
    renameDirectory: async function(directory, newname, cwd=false) {
        if (cwd) { directory = cwd + '/' + directory; }
        storage = await webfs.getStorage();
        curdir = false;
        if (directory || directory != '/') {
            for (let dirq of directory.split('/')) {
                if (!curdir) { founddir = storage.root.files.find(o => o.name === dirq && o.isdir); }
                else { founddir = curdir.files.find(o => o.name === dirq && o.isdir); }
                curdir = founddir;
            }
            if (curdir) {
                curdir.name = newname;
                webfs.saveStorage(storage);
            }
        }
    },
    removeDirectory: async function(directory) {
        storage = await webfs.getStorage();
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
                    index = curdir.files.findIndex(o => o.name === dirq && o.isdir);
                    delete curdir.files[index];
                    curdir.files = curdir.files.filter(async function(e){return e}); 
                }
            }
        }
        else {
            index = storage.root.files.findIndex(o => o.name === directory && o.isdir);
            delete storage.root.files[index];
            storage.root.files = storage.root.files.filter(async function(e){return e}); 
        }
        webfs.saveStorage(storage);
    },
    removeFile: async function(directory) {
        storage = await webfs.getStorage();
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
                    index = await curdir.files.findIndex(o => o.name === dirq && !o.isdir);
                    await webfs.remFileStore(curdir.files[index].hash);
                    delete curdir.files[index];
                    curdir.files = curdir.files.filter(async function(e){return e}); 
                }
            }
        }
        else {
            index = await storage.root.files.findIndex(o => o.name === directory && !o.isdir);
            await webfs.remFileStore(storage.root.files[index].hash);
            delete storage.root.files[index];
            storage.root.files = storage.root.files.filter(async function(e){return e}); 
        }
        webfs.saveStorage(storage);
    },
    getBase64: async function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
    },
    getMediaContent: async function(path) {
        obj = await webfs.getFile(path);
        return obj.contents;
    },
    uploadFile: async function(file, path=false) {
        filename = file.name;
        fileext = `.${filename.split('.')[filename.split('.').length - 1]}`
        if (path) { filename = path + '/' + file.name; }
        webfs.getBase64(file).then(
            async function(data) {
                await webfs.openFile(filename, metadata={encode: "base64"});
                await webfs.writeToFile(filename, data, encode=false);
                return filename;
            }
        );
    },
    downloadBase64File: async function(contentBase64, fileName) {
        const linkSource = `data:application/octet-stream;base64,${contentBase64}`;
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);
    
        downloadLink.href = linkSource;
        downloadLink.target = '_self';
        downloadLink.download = fileName;
        downloadLink.setAttribute('hidden', '');
        downloadLink.click();
        downloadLink.remove();
    }
}