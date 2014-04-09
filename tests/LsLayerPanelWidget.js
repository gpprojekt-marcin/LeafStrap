;(function ( $, undefined ) {
	$.widget("Leafstrap.layerpanel", {

		// own properties
		map: null,

		layers: {},

		//default options
		options: {

		},

		_ifexist: function(variable) {
			if (typeof variable === 'undefined'){
				return;
			} else {
				return variable;
			}
		},

		// The _create method is fired after first call
		_create: function() {
			var self = this;

			if (typeof L === 'undefined'){
				throw new Error('There is no Leaflet');
			} else {
				if (!(self.map instanceof L.Map)) {
					self.map = new L.map(self.element.attr('id'));
				}
			};

			// catch Leaflet Map events

			this.map.on({
				"moveend": this._onMoveend,
				//"changelayer": this.onChangelayer,
				"layeradd": this._onAddlayer,
				"layerremove": this._onRemovelayer,
			});

			self.map.setView(self.options.center, self.options.zoom);

		},

		// The _create method is fired after every call without 'option' param
		_init: function() {
			var self = this;

			console.info('_init');
		},

		// Respond to any changes the user makes to the option method
		_setOption: function (option, value) {
			var self = this;

			switch(option) {
				case "layers":
					//this.options.someValue = doSomethingWith( value );
					console.log('layers');
					break;
				}

			console.info('_setOption');
			return this._superApply( arguments );
		},

		_destroy: function(){
			return this._super();
		},

		_updateLayersList: function() {
			var self = this;
			self.layers = {};

			$.each(self.map._layers, function(index, el) {
				if (el.options.name) {
					self.layers[el.options.name] = el;
				} else {
					self.layers[index] = el;
				}
			});

		},

		addLayer: function(layer) {
			var self = this;
			var newLayer;
			var options = {};
			
			$.each(layer, function(index, val) {
				if (index !== 'url' && index !== 'type') {
					options[index] = val;
				}
			});
			switch (layer.type) {
				case "wms":
				newLayer = L.tileLayer.wms(layer.url, options); //{layers:layer.layers, format:layer.format, transparent:layer.transparent}
				break;
			}
			self.map.addLayer(newLayer);
			self._updateLayersList();

			console.info('addLayer');
		},

	});
})( jQuery );