Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:[{ html:'My First Zzyzx App Version 2!'}, {xtype: 'rallyiterationcombobox'}, {xtype: 'rallyreleasecombobox'}],
    layout: 'hbox',
    launch: function() {
        console.log('This is version 2 ');
    }
});
