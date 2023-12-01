SimpleIDB = {
	initialize() {
		return new Promise((resolve, reject) => {
			let request = indexedDB.open('myDatabase')
			request.onupgradeneeded = function() {
				request.result.createObjectStore('myStore')
				resolve()
			}
			request.onerror = function() {
				reject(request.error)
			}
		})
	},

	get(key) {
		return new Promise((resolve, reject) => {
			let oRequest = indexedDB.open('myDatabase')
			oRequest.onsuccess = function() {
				let db = oRequest.result
				let tx = db.transaction('myStore', 'readonly')
				let st = tx.objectStore('myStore')
				let gRequest = st.get(key)
				gRequest.onsuccess = function() {
					resolve(gRequest.result)
				}
				gRequest.onerror = function() {
					reject(gRequest.error)
				}
			}
			oRequest.onerror = function() {
				reject(oRequest.error)
			}
		})
	},

	getAll() {
		return new Promise((resolve, reject) => {
			let oRequest = indexedDB.open('myDatabase')
			oRequest.onsuccess = function() {
				let db = oRequest.result
				let tx = db.transaction('myStore', 'readonly')
				let st = tx.objectStore('myStore')
				let gRequest = st.getAllKeys();
				gRequest.onsuccess = function() {
					resolve(gRequest.result)
				}
				gRequest.onerror = function() {
					reject(gRequest.error)
				}
			}
			oRequest.onerror = function() {
				reject(oRequest.error)
			}
		})
	},

	set(key, value) {
		return new Promise((resolve, reject) => {
			let oRequest = indexedDB.open('myDatabase')
			oRequest.onsuccess = function() {
				let db = oRequest.result
				let tx = db.transaction('myStore', 'readwrite')
				let st = tx.objectStore('myStore')
				let sRequest = st.put(value, key)
				sRequest.onsuccess = function() {
					resolve()
				}
				sRequest.onerror = function() {
					reject(sRequest.error)
				}
			}
			oRequest.onerror = function() {
				reject(oRequest.error)
			}
		})
	},

	remove(key) {
		return new Promise((resolve, reject) => {
			let oRequest = indexedDB.open('myDatabase')
			oRequest.onsuccess = function() {
				let db = oRequest.result
				let tx = db.transaction('myStore', 'readwrite')
				let st = tx.objectStore('myStore')
				let rRequest = st.delete(key)
				rRequest.onsuccess = function() {
					resolve()
				}
				rRequest.onerror = function() {
					reject(rRequest.error)
				}
			}
			oRequest.onerror = function() {
				reject(oRequest.error)
			}
		})
	}
}