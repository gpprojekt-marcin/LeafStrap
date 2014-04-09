;(function ($, window, Leaflet, undefined) {
	'use strict';
	var Leafstrap;

	Leafstrap = (function () {
			/**
			* Create a new instance
			* @class Leafstrap
			* @constructor
			*/
			function Leafstrap(args) {
				this.VERSION = '0.0.1';
				this.errors = [];
				this.loaded = false;
				this.dev = true;
				this.layers = [];
				this.map = {};
				this.extent = null;
				this.map_div = null;
				this.controls = [];

				//options
				this.options = {
					map_div: '#gmap',
					controls_div: '#controls',
					generate_controls: true,
					controls_position: google.maps.ControlPosition.RIGHT_TOP,
					type: 'marker',
					view_all: true,
					view_all_text: 'View All',
					start: 0,
				};

				//events
				beforeViewAll: function () {},
				afterViewAll: function () {},
				beforeShow: function (index, location, marker) {},
				afterShow: function (index, location, marker) {},
				afterCreateMarker: function (index, location, marker) {},
				beforeCloseInfowindow: function (index, location) {},
				afterCloseInfowindow: function (index, location) {},
				beforeOpenInfowindow: function (index, location, marker) {},
				afterOpenInfowindow: function (index, location, marker) {},
				afterRoute: function (distance, status, result) {},
				onPolylineClick: function (obj) {}
			};

					$.extend(true, this.o, args);
	}
}