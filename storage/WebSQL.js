/**
 * A class that gives access into WebSQL storage
 */
Ext.define('storage.WebSQL', {

    singleton: true,

    config:{
        /**
         * The database capacity in bytes (can't be changed after construction). 50MB by default.
         */
        capacity:50 * 1024 * 1024
    },

    /**
     * @private
     * The websql database object.
     */
    storage:null,

    connected: false,

    constructor: function (config) {
        this.callParent(config);

        this.storage = openDatabase('storage', '1.0', 'Offline resource storage', this.getCapacity());

        this.storage.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS items (key, value)');
        }, function (error) {
            console.error('WebSQL: Connection Error');
        }, function () {
            console.log('WebSQL: Connected');
        });
    },

    /**
     * Get an item from the store.
     * @param key The key to get.
     * @param callbacks object of success and failure callbacks
     */
    getItem:function (key, callbacks) {

        this.storage.transaction(function (tx) {
            tx.executeSql('SELECT * FROM items WHERE key = ?', [key], function (tx, results) {

                var len = results.rows.length;

                if (len > 0) {
                    callbacks.success(results.rows.item(0).value)
                } else {
                    callbacks.failure(); // no result
                }
            });
        }, function (error) {
            console.log('WebSQL: Error in getItem');
            callbacks.failure(error);
        });
    },

    /**
     * Set an item in the store.
     * @param key The key to set.
     * @param value The string to store.
     * @param callbacks object of success and failure callbacks
     */
    setItem:function (key, value, callbacks) {

        this.storage.transaction(function (tx) {
            //remove old version first
            tx.executeSql('DELETE FROM items WHERE key = ?', [key]);
            tx.executeSql('INSERT INTO items (key, value) VALUES (?, ?)', [key, value]);
        }, function (error) {
            console.log('WebSQL: Error in setItem:' + error.message);
            callbacks.failure(error.message);
        }, function () {
            callbacks.success(); // no value.
        });
    }
});