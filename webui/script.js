//  Example request to NSO JSONRPC

// jsonrpc request counter, each request should have an unique id.
let id = 0;
let xTh; // transaction handle

// Return JSON representation of method and param
const newRequest = (method, params) => {
    id += 1;
    return JSON.stringify({ jsonrpc: '2.0', id, method, params });
};

// JSON-RPC helper
// Return request promise
const jsonrpc = (method, params) => {
    const url = `/jsonrpc/${method}`;
    const body = newRequest(method, params);

    return fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json;charset=utf-8',
            'Content-Type': 'application/json;charset=utf-8',
        },
        body,
    }).then((response) => {
        if (response.status !== 200) {
            return Promise.reject(new Error(method, response, body));
        }
        return response.json();
    }).then((json) => {
        if (json.error) {
            return Promise.reject(new Error(json.error, body));
        }
        return json.result;
    });
};

// Check if a read/write transaction exists
const checkIfReadWriteTrans = () => (
    jsonrpc('get_trans', {}).then((resp) => {
        let res = false;
        resp.trans.forEach((transItem) => {
            if (transItem.mode === 'read_write') {
                res = transItem.th;
            }
        });
        return res;
    })
);

// Crate a new read/write transaction
const createNewTrans = () => (
    jsonrpc('new_trans', {
        db: 'running', mode: 'read_write', conf_mode: 'private' }).then(resp => resp.th)
);

// Get transaction id for existing or new transaction
const getTransHandle = () => (
    checkIfReadWriteTrans().then((existingTH) => {
        if (existingTH) {
            return existingTH;
        }
        return createNewTrans();
    })
);

// Check if change already exsist before create
const checkExists = (th, path) => (
    jsonrpc('exists', { th, path }).then(resp => resp.exists)
);

// Create a new trunk port
const createNew = (th, path) => (
    checkExists(th, path).then((existsResp) => {
        if (!existsResp) {
            return jsonrpc('create', { th, path }).then((createResp) => {
                if (JSON.stringify(createResp) === '{}') {
                    return 'Transaction updated';
                }
                return `resp ${JSON.stringify(createResp)}`;
            });
        }
        return 'The change already Exists!';
    })
);

// Set a value
const setValue = (th, path, value) => (
    jsonrpc('set_value', { th, path, value })
);

// Set basePath to "example-trunk-port" service
const basePath = '/webui-one-example-trunk-port:webui-one-example-trunk-port';

// Create a new trunk instance
const createNewTrunk = (th, trunkName) => {
    const path = `${basePath}{${trunkName}}`;
    return createNew(th, path);
};

// Delete trunk if exists (kind of update)
const deleteTrunk = (th, trunkName) => {
    const path = `${basePath}{${trunkName}}`;
    return checkExists(th, path).then((existsResp) => {
        if (existsResp) {
            return jsonrpc('delete', { th, path });
        }
        return false;
    });
};

// Set vlan id for trunk
const setVlan = (th, trunkName, vlanId) => {
    const path = `${basePath}{${trunkName}}/vlanid`;
    return setValue(th, path, vlanId);
};

// Add a interface to device, device will be auto created when adding interface
const addInterface = (th, trunkName, deviceName, interF) => {
    const path = `${basePath}{${trunkName}}/device{${deviceName}}/interface{${interF}}`;
    return createNew(th, path);
};

// Called on click in webui, execute create and set operations
const doCreate = () => { // eslint-disable-line no-unused-vars
    const trunkName = document.getElementById('trunkname').value;
    const deviceA = document.getElementById('setDeviceA').value;
    const interfaceA = document.getElementById('setInterfaceA').value;
    const deviceB = document.getElementById('setDeviceB').value;
    const interfaceB = document.getElementById('setInterfaceB').value;
    const vlanId = document.getElementById('setVlan').value;

    deleteTrunk(xTh, trunkName).then((res) => {
        createNewTrunk(xTh, trunkName).then(() => {
            setVlan(xTh, trunkName, vlanId).then(() => {
                Promise.all([
                    addInterface(xTh, trunkName, deviceA, interfaceA),
                    addInterface(xTh, trunkName, deviceB, interfaceB),
                ]).then(() => {
                    if (res) {
                        document.getElementById('result').innerText = 'Updated';
                    } else {
                        document.getElementById('result').innerText = 'Created';
                    }
                    location.reload();
                });
            });
        });
    });
};

// Get a list of existing trunks created with this service
const getExistingTrunks = (th) => {
    const path = '/webui-one-example-trunk-port:webui-one-example-trunk-port';
    const resultAs = 'leaf_value_as_string';
    const selection = ['name'];
    jsonrpc('query', { th, path, result_as: resultAs, selection }).then((res) => {
        const element = document.getElementById('trunks');
        (res.results || []).forEach((trunk) => {
            const opt = document.createElement('option');
            opt.value = trunk;

            element.appendChild(opt);
        });
    });
};

window.addEventListener('load', () => {
    getTransHandle().then((res) => {
        xTh = res;
        getExistingTrunks(xTh);
    });
});
