<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Pozi Mobile</title>
        <link rel="stylesheet" href="style.mobile.css" type="text/css">
        <link rel="stylesheet" href="/touch/resources/css/sencha-touch.css">
        <link href="bootstrap/css/bootstrap.css" rel="stylesheet" type="text/css" />
    	<link href="bootstrap/css/bootstrap-responsive.css" rel="stylesheet" type="text/css" />
    	
    	<script>
    	
    		<?php session_start(); ?>
    		
    	</script>
    	
    	<script src="OpenLayers.mobile.js" type="text/javascript"></script>
        <script src="/touch/sencha-touch.js" type="text/javascript"></script>
        <script src="mobile-sencha.js" type="text/javascript"></script>
        <script src="mobile-base.js" type="text/javascript"></script>
        
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js" type="text/javascript"></script>
   	
   	<script type="text/javascript">

  	var _gaq = _gaq || [];
  	_gaq.push(['_setAccount', 'UA-34155236-1']);
  	_gaq.push(['_trackPageview']);

  	(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  	})();

	$(document).ready(function()
	{
    	$("#modal4").modal('show');
	});
            
		Ext.BLANK_IMAGE_URL = "img/blank.gif";
        var app = new Ext.Application({
            name: "ol",
            launch: function() {
                this.viewport = new Ext.Panel({
                    fullscreen: true,
                    dockedItems: [{
                        dock: "bottom",
                        xtype: "toolbar",
                        ui: "light",
                        layout: {
                            pack: "center"
                        },
                        items: [{
								iconCls: "search",
								iconMask: true,
								handler: function() {
									// this is the app
									if (!app.searchFormPopupPanel) {
										app.searchFormPopupPanel = new App.SearchFormPopupPanel({
											map: map
										});
									}
									app.searchFormPopupPanel.show('pop');
								}
							}, {
								iconCls: "locate",
								iconMask: true,
								handler: function() {
									var geolocate = map.getControlsBy("id", "locate-control")[0];
									if (geolocate.active) {
										geolocate.getCurrentLocation();
									} else {
										geolocate.activate();
									}
								}
							},{
								xtype: "spacer"
							}, {
								iconMask: true,
								iconCls: "add",
								handler: function() {
									map.zoomIn();
								}
							}, {
								iconMask: true,
								iconCls: "minus",
								handler: function() {
									map.zoomOut();
								}
							}, {
								xtype: "spacer"
							}, {
								iconMask: true,
								iconCls: "layers",
								handler: function() {
									if (!app.popup) {
										app.popup = new Ext.Panel({
											floating: true,
											modal: true,
											centered: true,
											hideOnMaskTap: true,
											width: 240,
											items: [{
												xtype: 'app_layerlist',
												map: map
											}],
											scroll: 'vertical'
										});
									}
									app.popup.show('pop');
								}
							}]
                    },{
                        dock: "top",
                        xtype: "toolbar",
                        ui: "light",
                        layout: {
                            pack: "right"
                        },
                        items: [{
								iconCls: "write",
								iconMask: true,
								handler: function() {
									if (!app.captureFormPopupPanel) {
										app.captureFormPopupPanel = new App.CaptureFormPopupPanel({
											map: map
										});
									}
									else
									{
										// Updating the lat / lon values in the existing form
										app.captureFormPopupPanel.formContainer.setValues({
											'lat':map.getCenter().transform(sm,gg).lat,
											'lon':map.getCenter().transform(sm,gg).lon
										});
									}
									app.captureFormPopupPanel.show('pop');
								}
                        }]
                    }
                    ],
                    items: [
                        {
                            xtype: "component",
                            scroll: false,
                            monitorResize: true,
                            id: "map",
                            listeners: {
                                render: function() {
                                    var self = this;
                                    init()
                                },
                                resize: function() {
                                    if (window.map) {
                                        map.updateSize();
                                    }
                                }
//                                ,
//                                scope: {
//                                    featurePopup: null
//                                }
                            }
                        }
                    ]
                });
            }
        });
        
    </script>
    
        <style>
            .searchList {
                min-height: 150px;
            }

            .close-btn {
                position: absolute;
                right: 10px;
                top: 10px;
            }

            img.minus {
                -webkit-mask-image: url(img/minus1.png);
            }

            img.write {
                -webkit-mask-image: url(img/pen.png);
            }

            img.add {
                -webkit-mask-image: url(img/round_plus.png);
            }

            img.layers {
                -webkit-mask-image: url(img/list.png);
            }

            .gx-layer-item {
                margin-left: 10px;
            }

            #map {
                width: 100%;
                height: 100%;
            }

            #title, #tags, #shortdesc {
                display: none;
            }

            .olControlAttribution {
                font-size: 10px;
                bottom: 5px;
                right: 5px;
            }

			.toolbar-text {
				position: static;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				padding: 0 12px;
			}

			.container-bg
			{
				-webkit-background-size: cover;
				-moz-background-size: cover;
				-o-background-size: cover;
				background-size: cover;
			}	
			.well
			{
				min-height: 10px;
				padding: 10px;
				margin-bottom: 10px;
				background-color: whiteSmoke;
				background: rgba(250, 250, 250, 0.8);
				border: 1px solid #EEE;
				border: 1px solid rgba(0, 0, 0, 0.05);
				-webkit-border-radius: 4px;
				-moz-border-radius: 4px;
				border-radius: 30px;
				-webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
				-moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
				box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
				margin-left: auto;
				margin-right: auto;
				width: 250px;
			}
			body 
    		{
    			text-align: center;
        		padding-top: 60px; /* 60px to make the container go all the way to the bottom of the topbar */
    		}
			.btnLogin
			{
    			
    			border-radius:15px;
    			background:#a1d8f0;
    			background:-moz-linear-gradient(top, #badff3, #7acbed);
    			background:-webkit-gradient(linear, left top, left bottom, from(#badff3), to(#7acbed));
				-ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorStr='#badff3', EndColorStr='#7acbed')";
    			border:1px solid #7db0cc !important;
    			cursor: pointer;
    			
    			font:bold 11px/14px Verdana, Tahomma, Geneva;
    			text-shadow:rgba(0,0,0,0.2) 0 1px 0px; 
    			color:#fff;
    			-moz-box-shadow:inset rgba(255,255,255,0.6) 0 1px 1px, rgba(0,0,0,0.1) 0 1px 1px;
    			-webkit-box-shadow:inset rgba(255,255,255,0.6) 0 1px 1px, rgba(0,0,0,0.1) 0 1px 1px;
    			box-shadow:inset rgba(255,255,255,0.6) 0 1px 1px, rgba(0,0,0,0.1) 0 1px 1px;
    			margin-left:12px;
				padding:7px 21px;
			}

			.btnLogin:hover,
			.btnLogin:focus,
			.btnLogin:active
			{
    			background:#a1d8f0;
    			background:-moz-linear-gradient(top, #7acbed, #badff3);
    			background:-webkit-gradient(linear, left top, left bottom, from(#7acbed), to(#badff3));
				-ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorStr='#7acbed', EndColorStr='#badff3')";
			}
			.btnLogin:active
			{
    			text-shadow:rgba(0,0,0,0.3) 0 -1px 0px; 
			}
			input
			{
				font:bold 14px/14px Verdana, Tahomma, Geneva;
			}
			select,
			textarea,
			input[type="text"],
			input[type="password"],
			input[type="datetime"],
			input[type="datetime-local"],
			input[type="date"],
			input[type="month"],
			input[type="time"],
			input[type="week"],
			input[type="number"],
			input[type="email"],
			input[type="url"],
			input[type="search"],
			input[type="tel"],
			input[type="color"],
			.uneditable-input {
  				display: inline-block;
  				height: 18px;
  				padding: 4px;
  				margin-bottom: 9px;
  				font-size: 13px;
  				line-height: 18px;
  				color: #000000;
			}
			
        	</style>

    </head>
    
	<body class="container-bg">
		
        <h1 id="title">OpenLayers with Sencha Touch</h1>
		
        <div id="tags">
            mobile, sencha touch
        </div>
        <p id="shortdesc">
            Using Sencha Touch to display an OpenLayers map.
        </p>
        <div id="crosshair" style="position:relative;left:50%;top:50%;z-index:10000;width:12px;font-size: 36px;opacity : 0.75;"><span style="position:relative;left:-12px;top:-18px;">+</span></div>
        
		<div class="modal modal1 hide" id="modal4">
  			<div class="modal-header">
  			</div>
  			<div class="modal-body login">
  				
  				<?php
				
    			if(isset($_SESSION['pass']))
    			{
      				("#modal4").modal('hide');
    			}
      			
    			?>
  				
  				<form action="login.php" method="post">
				
				
				<input type="tel" id="pass" name="pass" style="height: 50px; width: 200px" placeholder="Please Enter Pin" />
				
				
				<div><input class="btnLogin" type="submit" value="Login"/></div>	
				
				</form>
				
  			</div>
		</div>
	</div>
	
	<script src="bootstrap/js/bootstrap-dropdown.js" type="text/javascript"></script>
	<script src="bootstrap-modal.js" type="text/javascript"></script>
	<script src="bootstrap/js/bootstrap-tooltip.js" type="text/javascript"></script>
	
	</body>
	
</html>