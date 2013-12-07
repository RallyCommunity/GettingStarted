// Custom Rally App that displays Defects in a grid and filter by Iteration and/or Severity.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css


    defectStore: undefined,       // app level references to the store and grid for easy access in various methods
    defectGrid: undefined,

    // Entry Point to App
    launch: function() {

      console.log('our second app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api

      this.pulldownContainer = Ext.create('Ext.container.Container', {    // this container lets us control the layout of the pulldowns; they'll be added below
        id: 'pulldown-container-id',
        layout: {
                type: 'hbox',           // 'horizontal' layout
                align: 'stretch'
            }
      });

      this.add(this.pulldownContainer); // must add the pulldown container to the app to be part of the rendering lifecycle, even though it's empty at the moment

      this._loadIterations();
    },

    // create iteration pulldown and load iterations
    _loadIterations: function() {
        this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
          fieldLabel: 'Iteration',
          labelAlign: 'right',
          width: 300,
          listeners: {
            ready: function(combobox) {             // on ready: during initialization of the app, once Iterations are loaded, lets go get Defect Severities
                 this._loadSeverities();
           },
        select: function(combobox, records) {   // on select: after the app has fully loaded, when the user 'select's an iteration, lets just relaod the data
                 this._loadData();
           },
           scope: this
         }
        });

        this.pulldownContainer.add(this.iterComboBox);   // add the iteration list to the pulldown container so it lays out horiz, not the app!
     },

    // create defect severity pulldown then load data
    _loadSeverities: function() {
        this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
          model: 'Defect',
          field: 'Severity',
          fieldLabel: 'Severity',
          labelAlign: 'right',
          listeners: {
            ready: function(combobox) {             // this is the last 'data' pulldown we're loading so both events go to just load the actual defect data
                 this._loadData();
           },
            select: function(combobox, records) {
                 this._loadData();
           },
           scope: this                              // <--- don't for get to pass the 'app' level scope into the combo box so the async event functions can call app-level func's!
         }

        });

        this.pulldownContainer.add(this.severityComboBox);    // add the severity list to the pulldown container so it lays out horiz, not the app!
     },

    // Get data from Rally
    _loadData: function() {

      var selectedIterRef = this.iterComboBox.getRecord().get('_ref');              // the _ref is unique, unlike the iteration name that can change; lets query on it instead!
      var selectedSeverityValue = this.severityComboBox.getRecord().get('value');   // remember to console log the record to see the raw data and relize what you can pluck out

      console.log('selected iter', selectedIterRef);
      console.log('selected severity', selectedSeverityValue);

      var myFilters = [                   // in this format, these are AND'ed together; use Rally.data.wsapi.Filter to create programatic AND/OR constructs
            {
              property: 'Iteration',
              operation: '=',
              value: selectedIterRef
            },
            {
              property: 'Severity',
              operation: '=',
              value: selectedSeverityValue
            }
          ];

      // if store exists, just load new data
      if (this.defectStore) {
        console.log('store exists');
        this.defectStore.setFilter(myFilters);
        this.defectStore.load();

      // create store
      } else {
        console.log('creating store');
        this.defectStore = Ext.create('Rally.data.wsapi.Store', {     // create defectStore on the App (via this) so the code above can test for it's existence!
          model: 'Defect',
          autoLoad: true,                         // <----- Don't forget to set this to true! heh
          filters: myFilters,
          listeners: {
              load: function(myStore, myData, success) {
                  console.log('got data!', myStore, myData);
                  if (!this.defectGrid) {           // only create a grid if it does NOT already exist
                    this._createGrid(myStore);      // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
                  }
              },
              scope: this                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
          },
          fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']   // Look in the WSAPI docs online to see all fields available!
        });
      }
    },

    // Create and Show a Grid of given defect
    _createGrid: function(myDefectStore) {

      this.defectGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myDefectStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'Severity', 'Iteration'
        ]
      });

      this.add(this.defectGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

    }

});
