;(function ( $, undefined ) {
	$.widget("Leafstrap.mappanel", {

		// own properties
		map: null,

		layers: {},

		//default options
		options: {
			zoom: 1,
			extent: null,
			center: [0,0],
			layers: []
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

			$(self.options.layers).each(function(index, el) {
				self.addLayer(el)
			});
			
			if (self.layers.length == 0){
				self._updateLayersList();
			}

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

		//public function
		setZoom: function(zoom) {
			var self = this;

			self.map.setZoom(zoom);
		},

		setOpacity: function(layer, opacity) {
			var self = this;
			self.layers[layer].setOpacity(opacity);
			self._onChangelayer(layer);
		},

		// map events

		_onMoveend: function() {

			console.info('onMoveend');
		},


		_onChangelayer: function(data) {
			console.info('onChangelayer');
			console.log(data);
		},

		_onAddlayer: function() {

			console.info('onAddlayer');
		},

		_onRemovelayer: function() {

			console.info('onRemovelayer');
		},

	});
})( jQuery );