// vim: set ts=4 sw=4:
/*jshint esversion: 8 */

/* -------------------------------------------------------------------------
   Persistent settings using IndexedDB
   ------------------------------------------------------------------------- */

var _settingsDb;

function _settingsDBOpen() {
        return new Promise((resolve, reject) => {
                if (_settingsDb)
                        resolve();

                var req = indexedDB.open("settings", 1);
                req.onsuccess = function (evt) {
                        _settingsDb = this.result;
                        resolve();
                };

                req.onerror = function (evt) {
                        reject(`Error opening IndexedDB: ${evt.target.errorCode}`);
                };
        
                req.onupgradeneeded = function (evt) {
                        _settingsDb = evt.currentTarget.result;
                        console.log("IndexedDB onupgradeneeded");
                        var store = _settingsDb.createObjectStore("settings", { keyPath: 'id', autoIncrement: true });
                };
        });
}

function settingsGet(name) {
        return _settingsDBOpen().then(() => new Promise((resolve, reject) => {
                var store = _settingsDb.transaction("settings", "readonly").objectStore("settings");
                var req = store.get(name);
                req.onsuccess = function(evt) {
                        var setting = evt.target.result;
                        if (setting)
                                resolve(setting.value);
                        else
                                resolve(null);
                };
                req.onerror = function(evt) {
                        reject(`Error getting setting ${evt.target.errorCode}`);
                };
        }));
}

function settingsSet(name, value) {
        return _settingsDBOpen().then(() => new Promise((resolve, reject) => {
                var store = _settingsDb.transaction("settings", "readwrite").objectStore("settings");
                var req;
                try {
                        req = store.put({id: name, "value": value});
                        resolve();
                } catch (e) {
                        reject(`Error saving setting ${name}: ${e}`);
                }
        }));
}