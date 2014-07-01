Ext.define('Offline.view.Main', {
    extend: 'Ext.Panel',
    xtype: 'main',

    config: {

    },

    initialize: function() {

        var store = Ext.getStore('Buttons'),
            toolbar = Ext.factory({
                xtype: 'toolbar'
            });

        this.add(toolbar);

        store.load({
            callback: function() {
                store.each(function(button) {

                    toolbar.add(Ext.factory({
                        xtype: 'button',
                        text: button.get('text')
                    }));

                });
            }
        })




    }
});
