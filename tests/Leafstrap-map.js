//(function ($) {

$.LeafStrap = $.LeafStrap || {};

$.LeafStrap.Map = function(element, options) {
	
	var self = this;
	this.element = element;

	this.options = $.extend({}, new $.fn.LeafStrap.defaults.map(), options);
	
	this.lsMapOptions = $.extend({}, this.options);
    
    this.lsMapOptions.maxBounds = new L.LatLngBounds(this.options.maxBounds);
    
    //this.lsMapOptions.crs = this.options.crs;
    //console.log(this.lsMapOptions);
    this.lsMap = new L.map(this.element[0], this.lsMapOptions);

    element.data('LeafStrap', this);
    this.layersList = {};
    this.idCounter = 0;

    // To bind and trigger jQuery events
    this.events = $({});

    this.handlers = {
        // Triggers the jQuery events, after the Leaflet events
        // happened without any further processing
        simple: function(data) {
            //console.log(self, this);
            //console.log(data.type);
            self.trigger(data.type);
        }
    };

    //bind all events for futher use
    this.lsMap.on({
        scope: this,
        click: this.handlers.simple,
        dblclick: this.handlers.simple,
        mousedown: this.handlers.simple,
        mouseup: this.handlers.simple,
        mouseover: this.handlers.simple,
        mouseout: this.handlers.simple,
        mousemove: this.handlers.simple,
        contextmenu: this.handlers.simple,
        focus: this.handlers.simple,
        blur: this.handlers.simple,
        preclick: this.handlers.simple,
        load: this.handlers.simple,
        unload: this.handlers.simple,
        viewreset: this.handlers.simple,
        movestart: this.handlers.simple,
        move: this.handlers.simple,
        moveend: this.handlers.simple,
        dragstart: this.handlers.simple,
        drag: this.handlers.simple,
        dragend: this.handlers.simple,
        zoomstart: this.handlers.simple,
        zoomend: this.handlers.simple,
        zoomlevelschange: this.handlers.simple,
        resize: this.handlers.simple,
        autopanstart: this.handlers.simple,
        layeradd: this.handlers.simple,
        layerremove: this.handlers.simple,
        baselayerchange: this.handlers.simple,
        overlayadd: this.handlers.simple,
        overlayremove: this.handlers.simple,
        locationfound: this.handlers.simple,
        locationerror: this.handlers.simple,
        popupopen: this.handlers.simple,
        popupclose: this.handlers.simple
    });

    if (this.options.layers!==undefined) {
        this.layers(this.options.layers);
    }
}

$.LeafStrap.Map.prototype = {

    layers: function(options) {
        var self = this;
        switch(arguments.length) {
        case 0:
            return this._allLayers();
        case 1:
            if (!$.isArray(options)) {
                return this._addLayer(options);
            }
            else {
                return $.map(options, function(layer) {
                    return self._addLayer(layer);
                }).reverse();
            }
            break;
        default:
            throw('wrong argument number');
        }
    },

    _allLayers: function() {
        var layers = [];
        $.each(this.layersList, function(id, layer) {
            var item = [layer.position(), layer];
            layers.push(item);
        });
        var sorted = layers.sort( function compare(a, b) {
            return a[0] - b[0];
        });
        var result = $.map(sorted, function(item) {
            return item[1];
        });
        return result.reverse();
    },

    _addLayer: function(options) {
        //console.log(options.url);
        var id = this._createId();
        var layer = new $.LeafStrap.Layer(this, id, options);
        //console.log(layer);
        // NOTE vmx 20120305: Not sure if this is a good idea, or if it would
        //     be better to include `options` with the preaddlayer event
        if (this._triggerReturn('preaddlayer', [layer])===false) {
            return false;
        }
        this.lsMap.addLayer(layer.lsLayer);

        this.layersList[id] = layer;
        if (layer.isVector) {
            this.vectorLayers.push(id);
        }
        //this._updateSelectFeatureControl(this.vectorLayers);

        layer.trigger('addlayer');
        return layer;
    },

    // Creates a new unique ID for a layer
    _createId: function() {
        return 'Leaflet_' + this.idCounter++;
    },

    _removeLayer: function(id) {
        var layer = this.layersList[id];
        if (this._triggerReturn('preremovelayer', [layer])===false) {
            return false;
        }

        this.lsMap.removeLayer(layer.lsLayer);

        // XXX vmx: shouldn't the layer be destroyed() properly?
        delete this.layersList[id];

        layer.trigger('removelayer');
        return this;
    },

    center: function (options) {
        var position;
        var zoom;
        var bounds;

        if (arguments.length===0) {
            return {
                position: this.lsMap.getCenter(),
                zoom: this.lsMap.getZoom(),
                box: this.lsMap.getBounds()
            }
        }

        if (arguments.position!==undefined) {
            if (arguments.position instanceof L.LatLng) {
                position = arguments.position;
            } else if (arguments.position instanceof Array) {
                position = new L.LatLng(arguments.position);
            } else {
                throw ('Position must be array or LatLng');
            }
        }

        if (arguments.zoom!==undefined) {
            if (typeof arguments.zoom == 'number') {
                zoom = arguments.zoom;
            } else {
                throw ('Zoom must be number');
            }
        }

        if (arguments.bounds!==undefined) {
            if (arguments.bounds instanceof L.LatLngBounds) {
                bounds = arguments.bounds;
            } else if (arguments.bounds instanceof Array) {
                bounds = new L.LatLngBounds(arguments.bounds[0], arguments.bounds[1]);
            } else {
                throw ('bounds must be instance of L.LatLngBounds or array of L.LatLng or array of array'); // I don't know how to describe it 
            }
        }

        if (position && zoom) {
            this.lsMap.setView(position, zoom);
        } else if (position) {
            this.lsMap.panTo(position);
        } else if (bounds) {
            this.lsMap.fitBounds(bounds);
        } 

    },

    bind: function(types, data, fn) {
        var self = this;

        // A map of event/handle pairs, wrap each of them
        if(arguments.length===1) {
            var wrapped = {};
            $.each(types, function(type, fn) {
                wrapped[type] = function() {
                    return fn.apply(self, arguments);
                };
            });
            this.events.bind.apply(this.events, [wrapped]);
        }
        else {
            var args = [types];
            // Only callback given, but no data (types, fn), hence
            // `data` is the function
            if(arguments.length===2) {
                fn = data;
            }
            else {
                if (!$.isFunction(fn)) {
                    throw('bind: you might have a typo in the function name');
                }
                // Callback and data given (types, data, fn), hence include
                // the data in the argument list
                args.push(data);
            }

            args.push(function() {
                return fn.apply(self, arguments);
            });

            this.events.bind.apply(this.events, args);
        }

        //this.events.bind.call(this.events, types, function() {
        //    data.apply(self, arguments);
        //});
        //this.events.bind.call(this.events, types, function() {
        //    data.apply(self, arguments);
        //});

        //this.events.bind.apply(this.events, arguments);
        //this.events.bind.call(this.events, types, $.proxy(data, self));
        //this.events.bind.apply(this.events, arguments);//.bind(this);
        //this.events.bind.apply(this.events, $.proxy(arguments));//.bind(this);
        //this.events.bind.apply(this.events, $.proxy(arguments));//.bind(this);
        //this.events.bind(types, data, fn);//.bind(this);
        //this.events.bind.call(this.events, types, data, fn);//.bind(this);
        return this;
    },

    /**To subscribe to the triggered events, you need to bind to the mapuuu.

     map.bind('myEvent', function(evt) {
         console.log('the values are: ' + evt.data[0] + ' and ' + evt.data[1])
     });
     map.trigger('myEvent', 'some', 'values');
    */

    trigger: function() {
        // There is no point in using trigger() insted of triggerHandler(), as
        // we don't fire native events
        this.events.triggerHandler.apply(this.events, arguments);
        return this;
    },

    // Basically a trigger that returns the return value of the last listener
    _triggerReturn: function() {
        return this.events.triggerHandler.apply(this.events, arguments);
    },

    destroy: function() {
        this.olMap.destroy();
        this.element.removeData('LeafStrap');
    }

};

$.LeafStrap.Layer = function(map, id, options) {

    var self = this;
    // apply default options that are not specific to a layer

    this.id = id;
    this.label = options.label || this.id;
    // a reference to the map object is needed as it stores e.g. the list
    // of all layers (and we need to keep track of it, if we delete a
    // layer)
    this.map = map;

    // to bind and trigger jQuery events
    this.events = $({});

    this.handlers = {
        // Triggers the jQuery events, after the OpenLayers events
        // happened without any further processing
        simple: function(data) {
            self.trigger(data.type);
        },
        // All OpenLayers events that are triggered by user interaction,
        // like clicking somewhere or selecting a feature, need to be
        // handled in a special way. Those OpenLayers events will then be
        // triggered by LeafStrap as well
        // In case of the "featureselected" event, this means that the
        // logic of handling the event is completely within the event
        // handler. When ".select()" on a feature is called, it will just
        // trigger the OpenLayers "featureselected" event, whose handler
        // will then trigger the corresponding jQuery event.
        includeFeature: function(data) {
            var feature = new $.LeafStrap.Feature(this, {lsFeature:
                                                        data.feature});
            this.trigger(data.type, [feature]);
        },
        prependLayer: function(data) {
            this.trigger('layer' + data.type);
        }
    };


    // create the actual layer based on the options
    // Returns layer and final options for the layer (for later re-use,
    // e.g. zoomToMaxExtent).
    var res = $.LeafStrap.Layer.types[options.type.toLowerCase()].call(
        this, options);
    this.lsLayer = res.layer;
    this.options = res.options;

    // Some good documentation for the events is needed. Here is a short
    // description on how the current events compare to the OpenLayer
    // events on the layer:
    // - added, remove: not needed, there's addlayer and removelayer
    // - visibilitychanged: not needed, there's the changelayer event
    // - move, moveend: not needed as you get them from the map, not the layer
    // - loadstart, loadend: renamed to layerloadstart, layerloadend
    this.lsLayer.on({
        scope: this,
        loading: this.handlers.simple,
        load: this.handlers.simple,
        tileloadstart: this.handlers.simple,
        tileload: this.handlers.simple,
        tileunload: this.handlers.simple
    });

    // To be able to retreive the LeafStrap layer, when we only have the
    // OpenLayers layer available. For example on the layeradded event.
    // NOTE vmx 2012-02-26: Any nicer solution is welcome
    this.lsLayer.LeafStrapId = this.id;
};

$.LeafStrap.Layer.prototype = {

    down: function(delta) {
        delta = delta || 1;
        var pos = this.position();
        pos = pos - delta;
        if (pos<0) {pos = 0;}
        this.position(pos);
        return this;
    },

    each: function () {},

    remove: function() {
        // remove references to this layer that are stored in the
        // map object
        return this._map.removeLayer(map._layers[this._leaflet_id]);
    },

    position: function(pos) {
        if (pos===undefined) {
            console.log(this);
            return this.map.lsMap.getLayerIndex(this.olLayer)-1; //////////////////////////////////////////////////////////////////////////////////////////
        }
        else {
            this.map.olMap.setLayerIndex(this.olLayer, pos+1);
            this.trigger('changelayer', ['position']);
            return this;
        }
    },

    up: function(delta) {
        delta = delta || 1;
        var pos = this.position();
        pos = pos + delta;
        this.position(pos);
        return this;
    },

    visible: function(vis) {
        if (vis===undefined) {
            return this.olLayer.getVisibility();
        }
        else {
            this.olLayer.setVisibility(vis);
            this.trigger('changelayer', ['visibility']);
            return this;
        }
    },

    opacity: function(opac) {
        if (opac===undefined) {
            // this.olLayer.opacity can be null if never
            // set so return the visibility
            var value = this.olLayer.opacity ?
            this.olLayer.opacity : this.olLayer.getVisibility();
            return value;
        }
        else {
            this.olLayer.setOpacity(opac);
            this.trigger('changelayer', ['opacity']);
            return this;
        }
    },

    // every event gets the layer passed in
    bind: function() {
        // Use the same bind function as for the map
        this.map.bind.apply(this, arguments);
        return this;
    },

    trigger: function() {
        var args = Array.prototype.slice.call(arguments);
        this.events.triggerHandler.apply(this.events, args);

        this._addLayerToArgs(args);

        this.map.events.triggerHandler.apply(this.map.events, args);
        return this;
    },
    // Basically a trigger that returns the return value of the last listener
    _triggerReturn: function() {
        var args = Array.prototype.slice.call(arguments);
        var ret = this.events.triggerHandler.apply(this.events, args);
        if (ret !== undefined) {
            return ret;
        }

        this._addLayerToArgs(args);
        return this.events.triggerHandler.apply(this.map.events, args);
    },
    // Adds the current layer to the event arguments, so that it is included
    // in the event on the map
    _addLayerToArgs: function(args) {
        // Add layer for the map event
        if (args.length===1) {
            args.push([this]);
        }
        else {
            args[1].unshift(this);
        }
    },

    features: function(options) {
        var self = this;
        switch(arguments.length) {
        // return all features
        case 0:
            return this._allFeatures();
        // add new feature(s)
        case 1:
            if (!$.isArray(options)) {
                return this._addFeature(options);
            }
            else {
                return $.map(options, function(feature) {
                    return self._addFeature(feature);
                });
            }
            break;
        default:
            throw('wrong argument number');
        }
    },
    _allFeatures: function() {
        var layer = this;
        return $.map(layer.olLayer.features, function(feature) {
            return new $.LeafStrap.Feature(layer, {olFeature: feature});
        });
    },
    _addFeature: function(options) {
        var feature = new $.LeafStrap.Feature(this, options);
        // NOTE vmx 2012-04-19: Not sure if this is a good idea, or if it would
        //     be better to include `options` with the preaddfeature event
        if (this._triggerReturn('preaddfeature', [feature])===false) {
            return false;
        }
        this.olLayer.addFeatures(feature.olFeature);
        this.trigger('addfeature', [feature]);
        return feature;
    }
};

$.fn.LeafStrap = function(options) {
    return this.each(function() {
        var instance = $.data(this, 'LeafStrap');
        if (!instance) {
            $.data(this, 'LeafStrap', new $.LeafStrap.Map($(this), options));
        }
    });
};




$.fn.LeafStrap.defaults = {
    // The controls for the map are per instance, therefore it need to
    // be an function that can be initiated per instance
    map: function() {
        return {
            // Remove quirky moveTo behavior, probably not a good idea in the
            // long run
            maxBounds: [[-20037508.34, -20037508.34], [20037508.34, 20037508.34]],
            center: [0,0],
            zoom: 1,
            minZoom: 0,
            maxZoom: 19,
            //crs: 'EPSG:900913',
        };
    },
    layer: {
        all: {
            isBaseLayer: false,
        //in general it is kinda pointless to load tiles outside a maxextent
            displayOutsideMaxExtent: false
        },
        bing: {
            transitionEffect: 'resize',
            view: 'road',
            sphericalMercator: true
        },
        google: {
            transitionEffect: 'resize',
            view: 'road',
            sphericalMercator: true
        },
        osm: {
            transitionEffect: 'resize',
            sphericalMercator: true
        },
        tms: {
            transitionEffect: 'resize',
            format: 'png'
        },
        wms: {
            // options for raster layers
            transparent: true,
            format: 'image/png',
        },
        vector: {
            // options for vector layers
            strategies: ['bbox']
        },
        wmts: {
            format: 'image/jpeg',
            requestEncoding: 'REST',
            sphericalMercator: false
        }
    }
};

$.extend($.LeafStrap.Layer, {
    types: {

        bing: function(options) {
            var o = $.extend(true, {}, $.fn.LeafStrap.defaults.layer.all,
                $.fn.LeafStrap.defaults.layer.bing,
                options);
            var view = o.view;
            switch(view){
                case 'road':
                    view = 'Road'; break;
                case 'hybrid':
                    view = 'AerialWithLabels'; break;
                case 'satellite':
                    view = 'Aerial'; break;
            }
            return {
                layer: new OpenLayers.Layer.Bing({name: o.label, type:view,key:o.key}),
                options: o
            };
        },

        google: function(options) {
            var o = $.extend(true, {}, $.fn.LeafStrap.defaults.layer.all,
                    $.fn.LeafStrap.defaults.layer.google,
                    options);
            var view = o.view;
            switch(view){
                case 'road':
                    view = google.maps.MapTypeId.ROADMAP; break;
                case 'terrain':
                    view = google.maps.MapTypeId.TERRAIN; break;
                case 'hybrid':
                    view = google.maps.MapTypeId.HYBRID; break;
                case 'satellite':
                    view = google.maps.MapTypeId.SATELLITE; break;
            }
            return {
                layer: new OpenLayers.Layer.Google(o.label, {type:view}),
                options: o
            };
        },

        osm: function(options) {
            var o = $.extend(true, {}, $.fn.LeafStrap.defaults.layer.all,
                $.fn.LeafStrap.defaults.layer.osm,
                options);
            var label = options.label || undefined;

            if (options.layer) {
                switch(options.layer){
                    case 'simple':
                        o.url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; break;
                    case 'cycle':
                        o.url = 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'; break;
                    case 'transport':
                        o.url = 'http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'; break;
                    case 'mapquest':
                        o.url = 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png'; 
                        o.subdomains = '1234'; break;
                }

            }
            
            return {
                layer: new L.TileLayer(o.url, o),
                options: o
            };
        },

        wms: function(options) {
            var o = $.extend(true, {}, $.fn.LeafStrap.defaults.layer.all,
                    $.fn.LeafStrap.defaults.layer.wms,
                    options);

            return {
                layer: new L.TileLayer.WMS(o.url, o),
                options: o
            };
        },
    }
});

//})