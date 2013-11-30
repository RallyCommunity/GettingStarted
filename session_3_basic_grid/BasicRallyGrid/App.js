// Custom Rally App that displays Stories in a grid.


Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css


    // Entry Point to App
    launch: function() {
      console.log('our first app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
      this._loadData();                 // we need to prefix with 'this.' so we call a method found at the app level.
    },

    // Query Stories
    _loadData: function() {

      Ext.create('Rally.data.WsapiDataStore', {
          model: 'User Story',
          autoLoad: true,                         // <----- Don't forget to set this to true! heh
          listeners: {
              load: function(myStore, myData, success) {
                  console.log('got data!', myStore, myData);
                  this._createGrid(myStore);      // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
              },
              scope: this                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
          },
          fetch: ['FormattedID', 'Name', 'ScheduleState']   // Look in the WSAPI docs online to see all fields available!
        });


    },
   
    // Create and show a grid with data from the given store
    _createGrid: function(myStore) {

      var myGrid =Ext.create('Rally.ui.grid.Grid', {
        store: myStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID',
          'Name'
        ]
      });

      this.add(myGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

    }

});
