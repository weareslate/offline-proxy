Ext.define('Offline.store.Buttons', {

    requires: [
        'proxy.OfflineProxy',
        'Offline.model.Button'
    ],

    extend: 'Ext.data.Store',

    config: {
        model: 'Offline.model.Button',
        proxy: {
            type: 'offline',
            url: '/test-api/test-resource.json',
            storageKey: 'buttons',
            storageFacility: storage.WebSQL,
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }

    }

});