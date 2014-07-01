/**
 * Offline Proxy
 * @extend Ext.data.proxy.Ajax
 */
Ext.define('proxy.OfflineProxy', {

    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.offline',

    config: {
        storageKey: null,

        storageFacility: null,

        online: true
    },

    originalCallback: null,

    /**
     * Override doRequest so that we can intercept the request and
     * catch a failed request to fall back to offline
     * @param operation
     * @param callback
     * @param scope
     * @returns {*}
     */
    doRequest: function(operation, callback, scope) {

        var that = this,
            passCallback,
            request,
            fakedResponse = {};

        this.originalCallback = callback;

        function failedRequest() {
            fakedResponse.status = 500;
            fakedResponse.responseText = 'Error';
            fakedResponse.statusText = 'ERROR';

            that.processResponse(false, operation, request, fakedResponse, passCallback, scope);
        }

        if(this.getOnline()) {
            console.log('PROXY: Loading from online resource');
            return this.callParent(arguments);
        }else{
            console.log('PROXY: Loading from offline resource');
            request = this.buildRequest(operation);
            passCallback = this.createRequestCallback(request, operation, callback, scope);

            if(this.getStorageKey() && this.getStorageFacility()) {

                this.getStorageFacility().getItem(this.getStorageKey(),  {
                    success: function(dataString) {

                        fakedResponse.status = 200;
                        fakedResponse.responseText = dataString;
                        fakedResponse.statusText = 'OK';

                        that.processResponse(true, operation, request, fakedResponse, passCallback, scope);

                    },
                    failure: failedRequest
                });
            }else{
                console.error('No storage key or facility for proxy');
                setTimeout(function() {
                    failedRequest();
                }, 1);

            }

        }

    },

    /**
     * Override processResponse so that if we are online we can store the response
     * into the offline storage method provided and if a response fails,
     * we can fall back.
     * @param success
     * @param operation
     * @param request
     * @param response
     * @param callback
     * @param scope
     */
    processResponse: function(success, operation, request, response, callback, scope) {

        var that = this;

        if(success) {

            console.log('PROXY: Request succeeded');


            this.callParent(arguments);

            if(this.getOnline()) {
                if(this.getStorageKey() && this.getStorageFacility()) {
                    this.getStorageFacility().setItem(this.getStorageKey(), response.responseText, {
                        success: function() {
                            console.log('PROXY: Data stored to offline storage: ' + that.getStorageKey());
                        },
                        failure: function(error) {
                            console.log('PROXY: Error in storing data: ' + that.getStorageKey());
                        }
                    });
                }else{
                    console.error('PROXY: No storage key or facility for proxy');
                }
            }

        }else{
            if(this.getOnline()) {
                //If the request failed and we were online, we need to try and fall back to offline
                console.log('PROXY: Request failed, will try to fallback to offline');
                this.setOnline(false);

                this.doRequest(operation, this.originalCallback, scope);
            }else{
                this.callParent(arguments);
            }
        }


    }

});