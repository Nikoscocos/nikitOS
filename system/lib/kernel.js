var kernel = {
    createWorker: function(name, code, onstop=false, timeout=0) {
        hash = (Math.random() + 1).toString(36).substring(2);
        setTimeout(() => {
            worker = {
                name: name,
                func: code,
                stopfunc: onstop,
                timeout: timeout
            }
            vfs.vmem.kernel.proc[hash] = worker;
            code();
        }, timeout);
        return hash;
    },
    stopWorker: function(hash) {
        worker = vfs.vmem.kernel.proc[hash];
        if (worker.stopfunc) { worker.stopfunc(); }
        vfs.vmem.kernel.proc[hash] = null;
        delete vfs.vmem.kernel.proc[hash];
    },
    createThread: function(name, code, important=false, onstop=false, data=null, ticks=1000) {
        hash = (Math.random() + 1).toString(36).substring(2);
        thid = createInterval(() => {
            try { code(data.hash); }
            catch { window.clearInterval(thid); }
        }, ticks, data={hash: hash, data: data});
        thread = {
            name: name,
            func: code,
            stopfunc: onstop,
            ticks: ticks,
            id: thid,
            important: important
        }
        vfs.vmem.kernel.threads[hash] = thread;
        return hash;
    },
    stopThread: function(hash, by='user') {
        thread = vfs.vmem.kernel.threads[hash];
        clearInterval(thread.id);
        if (thread.stopfunc) { thread.stopfunc(); }
        vfs.vmem.kernel.threads[hash] = null;
        delete vfs.vmem.kernel.threads[hash];
        if (thread.important) {
            if (by != 'system') {
                kernel.handlePanic(
                    'High-priority process killed',
                    thread.name
                );
            }
        }
    },
    handlePanic: async function(error, desc, errobj=false) {
        logd = [];
        stacked = '';

        logd.push('KERNEL PANIC');
        logd.push('System halted!');
        logd.push(' ');

        if ('vfs' in window) {
            for (th in vfs.vmem.kernel.threads) {
                kernel.stopThread(th, by='system');
                logd.push(`[thread] Killing thread: "${th}", by: system`);
            }
            auds = Object.keys(vfs.vmem.svcache).filter(function(value) { return value.includes('_aud') });
            for (let aud of auds) {
                logd.push(`[audioservice]\nStopping audio process: "${aud}"`);
                vfs.vmem.svcache[aud].pause();
            }
        }
        try { memdump = await kernel.getLoadInfo(); }
        catch { memdump = {
            tasks: undefined,
            load: {
                vmem: {
                    size: undefined,
                    bytes: undefined
                },
                vfs: {
                    size: undefined,
                    bytes: undefined
                }
            }
        }}
        stack = ` \nnikitOS Kernel Error:\n    (panic) ${error}\n        --> ${desc}\n \ncurrent memory dump:\n    (load) vfs: ${memdump.load.vfs.size} / ${memdump.load.vfs.bytes}\n           vmem: ${memdump.load.vmem.size} / ${memdump.load.vmem.bytes}\n           tasks: ${memdump.tasks}\n \ncache info:`;
        if ('vfs' in window) { for (let vr in vfs.vmem.svcache) {
            stack += ` \n    ${vr}: ${JSON.stringify(vfs.vmem.svcache[vr])}`;
        }}
        for (let line of stack.split('\n')) {
            logd.push(line);
        }
        for (let log of logd) {
            stacked += `<div><p>${log.replace(' ', '&nbsp;')}</p></div>`;
        }
        template = `
        <div class="err-cont">
            <div class="errinfo">
                ${stacked}
            </div>
        </div>
        `;
        document.body.innerHTML = template + document.body.innerHTML;
        console.warn(`[kernel] PANIC\n\nerror: ${error}\ndesc: ${desc}`);
        window.onerror = null;
        delete vfs;
    },
    handleError: async function(event) {
        //event.preventDefault();
        console.warn(`[kernel]\nerror: ${event}`);
        if (!('vfs' in window)) { kernel.handlePanic('VFS missed', 'Virtual Filesystem is missed'); }
    },
    getLoadInfo: async function() {
        alltasks = vfs.vmem.windows.length + Object.keys(vfs.vmem.kernel.threads).length + Object.keys(vfs.vmem.kernel.proc).length;
        vmemsize = await webfs.getSize(JSON.stringify(vfs.vmem).length);
        vfssize = await webfs.getSize(JSON.stringify(vfs).length);
        vmembytes = JSON.stringify(vfs.vmem).length;
        vfsbytes = JSON.stringify(vfs).length;
        return {
            tasks: alltasks,
            load: {
                vmem: {
                    size: vmemsize,
                    bytes: vmembytes
                },
                vfs: {
                    size: vfssize,
                    bytes: vfsbytes
                }
            }
        }
    }
}