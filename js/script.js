;(function ( $, undefined ) {
	$.widget("Leafstrap.map", {

		// own properties
		map: null,

		layers: [],

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
				"moveend": this.onMoveend,
				//"changelayer": this.onChangelayer,
				"layeradd": this.onAddlayer,
				"layerremove": this.onRemovelayer,
			});

			self.map.setView(self.options.center, self.options.zoom);

			self._pushLayer(self.options.layers);
		},

		// The _create method is fired after every call without 'option' param
		_init: function() {
			var self = this;

			$(self.layers).each(function(index, el) {
				self.addLayer(el)
			});
			
			console.info('_init');
		},

		// Respond to any changes the user makes to the option method
		_setOption: function (option, value) {
			var self = this;

			switch(option) {
				case "layers":
					//this.options.someValue = doSomethingWith( value );
					self._pushLayer(value);
					console.log('layers');
					break;
				}

			console.info('_setOption');
			return this._superApply( arguments );
		},

		_destroy: function(){
			return this._super();
		},



		//private function
		_dataChanged: function(name, event, data) {
			//self._trigger('open');
			console.info('_dataChanged');
		},

		

		_pushLayer: function(layers) {
			var self = this;

			$(layers).each(function(index, el) {
				self.layers.push(el);
			});

			console.info('_pushLayer');
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

			console.info('addLayer');
		},

		//public function
		setZoom: function(source, event, data) {
			this._trigger('_dataChanged', event, data);
		},

		// map events

		onMoveend: function() {

			console.info('onMoveend');
		},

		/*onChangelayer: function() {

			console.info('onChangelayer');
		},*/

		onAddlayer: function() {

			console.info('onAddlayer');
		},

		onRemovelayer: function() {

			console.info('onRemovelayer');
		},

	});
})( jQuery );