Ext.ns('App');

/**
 * Custom class for the Search 
 */
App.SearchFormPopupPanel = Ext.extend(Ext.Panel, {
    map: null,
    floating: true,
    modal: true,
    centered: true,
    hideOnMaskTap: true,
    width: Ext.is.Phone ? undefined : 400,
    height: Ext.is.Phone ? undefined : 500,
    scroll: false,
    layout: 'fit',
    fullscreen: Ext.is.Phone ? true : undefined,
    url: 'http://basemap.pozi.com/ws/rest/v3/ws_all_features_by_string_and_lga.php',
    errorText: 'Sorry, we had problems communicating with Pozi search. Please try again.',
    errorTitle: 'Communication error',
    maxResults: 6,
    featureClass: "P",
    
    createStore: function(){
        this.store = new Ext.data.JsonStore({
			autoLoad: false, //autoload the data
			root: 'rows',
			fields: [{name: "label"	, mapping:"row.label"},
				{name: "xmini"	, mapping:"row.xmini"},
				{name: "ymini"	, mapping:"row.ymini"},
	 			{name: "xmaxi"	, mapping:"row.xmaxi"},
				{name: "ymaxi"	, mapping:"row.ymaxi"},
				{name: "gsns"	, mapping:"row.gsns"},
	 			{name: "gsln"	, mapping:"row.gsln"},
	 			{name: "idcol"	, mapping:"row.idcol"},
	 			{name: "idval"	, mapping:"row.idval"},
	 			{name: "ld"	, mapping:"row.ld"}
	 		],
			proxy: {
				type: 'scripttag',
				timeout: 5000,
				listeners: {
					exception: function(){
						this.hide();
						Ext.Msg.alert(this.errorTitle, this.errorText, Ext.emptyFn);
					},
					scope: this
				},
				url: this.url,
				reader: {
					type: 'json',
					root: 'rows'
				}
			}
	});
    },
    
    doSearch: function(searchfield, evt){
        var q = searchfield.getValue();
        this.store.load({
            params: {
                query: q,
                config: 'vicmap',
                lga:'348'
            }
        });
    },
    
    onItemTap: function(dataView, index, item, event){
        var record = this.store.getAt(index);
        var xmin = record.get('xmini');
        var ymin = record.get('ymini');
        var xmax = record.get('xmaxi');
        var ymax = record.get('ymaxi');    
        var x = xmin/2+xmax/2;
        var y = ymin/2+ymax/2;
        //alert("Moving to x:"+x+" y:"+y);
        var lonlat = new OpenLayers.LonLat(xmin/2+xmax/2, ymin/2+ymax/2);
        map.setCenter(lonlat.transform(gg, sm), 18);
        this.hide("pop");
    },
    
    initComponent: function(){
        this.createStore();
        this.resultList = new Ext.List({
            scroll: 'vertical',
            cls: 'searchList',
            loadingText: "Searching ...",
            store: this.store,
            itemTpl: '<div>{label}</div>',
            listeners: {
                itemtap: this.onItemTap,
                scope: this
            }
        });
        this.formContainer = new Ext.form.FormPanel({
            scroll: false,
            items: [{
                xtype: 'button',
                cls: 'close-btn',
                ui: 'decline-small',
                text: 'Close',
                handler: function(){
                    this.hide();
                },
                scope: this 
            }, {
                xtype: 'fieldset',
                scroll: false,
                title: 'Search for a place',
                items: [{
                    xtype: 'searchfield',
                    label: 'Search',
                    placeHolder: 'placename',
                    listeners: {
                        action: this.doSearch,
                        scope: this
                    }
                },
                    this.resultList
                ]
            }]
        });
        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            items: [this.formContainer]
        }];
        App.SearchFormPopupPanel.superclass.initComponent.call(this);
    }
});

App.LayerList = Ext.extend(Ext.List, {
    
    map: null,
    
    createStore: function(){
        Ext.regModel('Layer', {
            fields: ['id', 'name', 'visibility', 'zindex']
        });
        var data = [];
        Ext.each(this.map.layers, function(layer){
            if (layer.displayInLayerSwitcher === true) {
                var visibility = layer.isBaseLayer ? (this.map.baseLayer == layer) : layer.getVisibility();
                data.push({
                    id: layer.id,
                    name: layer.name,
                    visibility: visibility,
                    zindex: layer.getZIndex()
                });
            }
        });
        return new Ext.data.Store({
            model: 'Layer',
            sorters: 'zindex',
            data: data
        });
    },
    
    initComponent: function(){
        this.store = this.createStore();
        this.itemTpl = new Ext.XTemplate(
            '<tpl if="visibility == true">', 
                '<img width="20" src="img/check-round-green.png">', 
            '</tpl>', 
            '<tpl if="visibility == false">', 
                '<img width="20" src="img/check-round-grey.png">', 
            '</tpl>', 
            '<span class="gx-layer-item">{name}</span>'
        );
        this.listeners = {
            itemtap: function(dataview, index, item, e){
                var record = dataview.getStore().getAt(index);
                var layer = this.map.getLayersBy("id", record.get("id"))[0];
                if (layer.isBaseLayer) {
                    this.map.setBaseLayer(layer);
                }
                else {
                    layer.setVisibility(!layer.getVisibility());
                }
                record.set("visibility", layer.getVisibility());
            }
        };
        this.map.events.on({
            "changelayer": this.onChangeLayer,
            scope: this
        });
        App.LayerList.superclass.initComponent.call(this);
    },

    findLayerRecord: function(layer){
        var found;
        this.store.each(function(record){
            if (record.get("id") === layer.id) {
                found = record;
            }
        }, this);
        return found;
    },
    
    onChangeLayer: function(evt){
        if (evt.property == "visibility") {
            var record = this.findLayerRecord(evt.layer);
            record.set("visibility", evt.layer.getVisibility());
        }
    }
    
});
Ext.reg('app_layerlist', App.LayerList);


App.CaptureFormPopupPanel = Ext.extend(Ext.Panel, {
	map: null,
	propertyAddressStore: null,
	floating: true,
	modal: true,
	centered: true,
	// Deactivated mask on tap to allow for selection in the drop down list
	hideOnMaskTap: false,
	width: Ext.is.Phone ? undefined : 400,
	height: Ext.is.Phone ? undefined : 400,
	scroll: false,
	layout: 'fit',
	fullscreen: Ext.is.Phone ? true : undefined,
	//    url: '/ws/rest/v3/capture/ws_property_fire_hazard.php',
	errorText: 'Sorry, we had problems communicating with the Pozi server. Please try again.',
	errorTitle: 'Communication error',
        
	initComponent: function(){
		Ext.regModel('VacantLand', {
			// Potential issue if property numbers are repeated or missing - would be better to use a real PK for the Id field
			idProperty:'prop_num',
			fields: [
				{name: 'prop_num',    type: 'string', mapping: 'row.prop_num'},
				{name: 'address',     type: 'string', mapping: 'row.address'},
				{name: 'map_no',     type: 'string', mapping: 'row.map_no'},
				{name: 'land_use',     type: 'string', mapping: 'row.land_use'},
				{name: 'category',     type: 'string', mapping: 'row.category'},
				{name: 'cut_req',     type: 'string', mapping: 'row.cut_req'},
				{name: 'comments',     type: 'string', mapping: 'row.comments'}
			]
		});

		Ext.regModel('ReferenceTable', {
			// Potential issue if property numbers are repeated or missing - would be better to use a real PK for the Id field
			idProperty:'id',
			fields: [
				{name: 'id',     type: 'string'},
				{name: 'label',    type: 'string'}
			]
		});

		// Be careful to the refresh timeline of the content - it has to be refreshed each time the form is invoked
		vacantLandStore = new Ext.data.JsonStore({
			proxy: {
				type: 'scripttag',
				url : 'http://v3.pozi.com/ws/rest/v3/ws_closest_vacant_land.php',
				reader: {
					type: 'json',
					root: 'rows',
					totalCount : 'total_rows'
				}
			},
			// Max number of records returned
			pageSize: 10,	
			model : 'VacantLand',
			autoLoad : false,
			autoDestroy : true,
			listeners: {
				load: function(ds,records,o) {
					var cb = Ext.getCmp('address');
					var rec = records[0];
					cb.setValue(rec.data.type);
					cb.fireEvent('change',cb,rec);
					},
				scope: this
			}
		});
		
		cutRequiredDataStore = new Ext.data.JsonStore({
	           data : [
	                { id : '1', label : ''},
	                { id : '2', label : 'No'},
	                { id : '3', label : 'Yes'}
	           ],
	           model: 'ReferenceTable'
	        });

		this.formContainer = new Ext.form.FormPanel({
			id:'form_capture',
			scroll: true,
			items: [{
					xtype: 'selectfield',
					label: 'Address',
					name:'address',
					id:'address',
					valueField : 'prop_num',
					displayField : 'address',
					store : vacantLandStore,
					// By construction, this field will always be populated - so we technically don't have to mark it as required
					 required: true,
					 listeners:{
					 	'change':function(t,v){
							var ds = Ext.getCmp('form_capture').getFields().address.store.data.items;
							for (i in ds)
							{
								if (ds.hasOwnProperty(i))
								{
									if (ds[i].data.prop_num == Ext.getCmp('form_capture').getValues().address)
									{
										Ext.getCmp('form_capture').setValues({ 
											prop_number:ds[i].data.prop_num,
											map_no:ds[i].data.map_no,
											land_use:ds[i].data.land_use,
											category:ds[i].data.category,
											comments:ds[i].data.comments
										});
										
										// Slightly different variation to setup the drop down value for cut required
										var cb = Ext.getCmp('cut_req');
										cb.setValue(ds[i].data.cut_req);
										//cb.fireEvent('change',cb,rec);
										
										break;
									}
								}
							}

					 		//alert('selected');

					 	}
					 }
		                },
				{
					xtype: 'textfield',
					label: 'Property number',
					name:'prop_number',
					disabled: true
		                },
				{
					xtype: 'textfield',
					label: 'Map number',
					name:'map_no',
					disabled: true
		                },
				{
					xtype: 'textfield',
					label: 'Land use',
					name:'land_use',
					disabled: true
		                },
				{
					xtype: 'textfield',
					label: 'Category',
					name:'category',
					disabled: true
		                },
		                {
					xtype: 'selectfield',
					label: 'Cut required?',
					name:'cut_req',
					id:'cut_req',
					valueField : 'id',
					displayField : 'label',
					store : cutRequiredDataStore,
					// By construction, this field will always be populated - so we technically don't have to mark it as required
					 required: true
		                },
				{
					xtype: 'textfield',
					label: 'Comments',
					name:'comments'
		                },
				{  
					xtype:'hiddenfield',
					name:'config',
					value: 'monashgis'
				}
			],
			dockedItems: [{
				xtype: 'toolbar',
				dock: 'bottom',
				items: [{
					text: 'Cancel',
					handler: function() {
						// Important: clear the store elements before resetting the form
						while(vacantLandStore.getCount()>0)
						{
							vacantLandStore.removeAt(0);
						}
						Ext.getCmp('form_capture').reset();
						app.captureFormPopupPanel.hide();
					}
				},
				{xtype: 'spacer'},
				{
					text: 'Save',
					ui: 'confirm',
					handler: function() {

						Ext.getCmp('form_capture').submit({
							url: '/ws/rest/v3/ws_update_vacant_land.php',
							submitEmptyText: false,
							method: 'POST',
							waitMsg: 'Saving ...',
							success: on_capture_success,
							failure: on_capture_failure
						});
					}
				}]
			}]
		});
        
		var on_capture_success = function(form, action){
			// Important: clear the store elements before resetting the form
			while(vacantLandStore.getCount()>0)
			{
				vacantLandStore.removeAt(0);
			}
			Ext.getCmp('form_capture').reset();
			app.captureFormPopupPanel.hide();
			
			// Reload the vector layer - it should contain the new point
			wmsLayer.redraw();			
		};

		var on_capture_failure = function(form, action){
			alert("Capture failed");
		};
        
		this.items = [{
			xtype: 'panel',
			layout: 'fit',
			items: [this.formContainer]
		}];
		App.CaptureFormPopupPanel.superclass.initComponent.call(this);
	},
	listeners : {
		show:function(){
			if (vacantLandStore)
		    	{
				if (vacantLandStore.getCount() > 0)
				{
					// This should not happen as we empty the store on save and cancel
					alert('store exists and is populated');
					
				}
				else
				{
					// Populate the combo on show
					var latlon = map.getCenter();
					latlon.transform(sm, gg);
					vacantLandStore.load({params:{longitude:latlon.lon,latitude:latlon.lat,config:'monashgis'}});

				}				
			}
			else
			{
				// Unclear if this is a valid scenario
				alert('store does not exist');
			}
		    },
	}

});
