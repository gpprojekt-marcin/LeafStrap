(function($) {
$.template('lsLayerManager',
    '<div class="ls-layermanager panel panel-default ">'+
    '<div class="ls-layermanager-content panel-group" id="accordion"></div>'+
    '</div>');

$.template('lsLayerManagerHeader',
    '<div class="ls-layermanager-header panel-heading"><h4 class="panel-title">${title}</h4></div>');

$.template('lsLayerManagerToolbar',
    '<div class="ls-layermanager-toolbar panel-heading">'+
    '<div class="btn-toolbar"><div class="btn-group btn-group-xs">'+
    '<button type="button" class="btn btn-default"><i class="fa fa-plus"></i></button>'+
    '<button type="button" class="btn btn-default"><i class="fa fa-minus"></i></button>'+
    '</div></div></div>');

$.template('lsLayerManagerElement',
    '<div class="ls-layermanager-element panel panel-info panel-mini" id="ls-layermanager-element-${id}">'+
    '<div class="ls-layermanager-element-header panel-heading">'+
    '<div class="ls-layermanager-label panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#ls-layermanager-element-header-${id}">${label}</a>'+
    '<button type="button" class="panel-close close" data-dismiss="alert" aria-hidden="true">&times;</button></div></div>'+
    //'<a class="ui-dialog-titlebar-close" href="#" role="button">'+
    //'<span class="ui-icon ui-icon-closethick">close</span></a></div>'+
    '<div class="ls-layermanager-element-content panel-body panel-collapse collapse" id="ls-layermanager-element-header-${id}">'+
        '<div class="ls-layermanager-element-visibility input-group input-group-sm">'+
            '<span class="input-group-addon"><input type="checkbox" class="ls-layermanager-element-vischeckbox" id="${id}-visibility" {{if visible}}checked="${visible}"{{/if}} /></span>'+
            '<div class="ls-layermanager-element-slider-container form-control">'+
        '<div class="ls-layermanager-element-slider"></div></div>'+
        '</div>'+
        '<div class="ls-layermanager-element-legend">'+
            '{{if imgUrl}}'+
                '<img src="${imgUrl}" style="opacity:${opacity}"/>'+
            '{{/if}}'+
            '{{if errMsg}}'+
                '<div class="alert alert-warning alert-dismissable">'+
                '${errMsg}'+
                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button></div>'+
            '{{/if}}'+
        '</div>'+
    '</div>'+
    '</div>');

$.widget("LeafStrap.lsLayerManager", {
    options: {
        // The MapQuery instance
        map: undefined,
        header: true,
        toolbar: true,
        // Title that will be displayed at the top of the popup
        title: "Layer Manager"
    },
    _create: function() {
        var map;
        var zoom;
        var numzoomlevels;
        var self = this;
        var element = this.element;
        //get the mapquery object
        map = $(this.options.map).data('LeafStrap') || $('#map');

        this.element.addClass('ui-widget  ui-helper-clearfix');

        var lmElement = $.tmpl('lsLayerManager').appendTo(element);
        element.find('.panel-close').button();

        lmElement.children('.ls-layermanager-content').sortable({
            axis:'y',
            handle: '.ls-layermanager-element-header',
            update: function(event, ui) {
                var layerNodes = ui.item.siblings().andSelf();
                var num = layerNodes.length-1;
                layerNodes.each(function(i) {
                    var layer = $(this).data('layer');
                    var pos = num-i;
                    self._position(layer, pos);
                });
            }
        });

        //these layers are already added to the map as such won't trigger 
    //and event, we call the draw function directly
        $.each(map.layers().reverse(), function(){
           self._layerAdded(lmElement, this);
        });

        element.delegate('.ls-layermanager-element-vischeckbox',
            'change',function() {
            var checkbox = $(this);
            var element = checkbox.parents('.ls-layermanager-element');
            var layer = element.data('layer');
            var self = element.data('self');
            self._visible(layer,checkbox.is(':checked'));
         });

        element.delegate('.panel-close', 'click', function() {
            var control = $(this).parents('.ls-layermanager-element');
            self._remove(control.data('layer'));
        });

        //binding events
        map.bind("addlayer",
            {widget:self,control:lmElement},
            self._onLayerAdd);

        map.bind("removelayer",
            {widget:self,control:lmElement},
            self._onLayerRemove);

        map.bind("changelayer",
            {widget:self,map:map,control:lmElement},
            self._onLayerChange);

        map.bind("moveend",
            {widget:self,map:map,control:lmElement},
            self._onMoveEnd);
    },

    _init: function() {
        var lm = this.element.children('.ls-layermanager');

        if (this.options.toolbar) {
            var lmToolbar = $.tmpl('lsLayerManagerToolbar').prependTo(lm);
        }

        if (this.options.header) {
            var lmHeader = $.tmpl('lsLayerManagerHeader',{
                title: this.options.title,
            }).prependTo(lm);
        }
    },

    _destroy: function() {
        console.info('beton');
        this.element.removeClass(' ui-widget ui-helper-clearfix')
            .empty();
    },
    //functions that actually change things on the map
    //call these from within the widget to do stuff on the map
    //their actions will trigger events on the map and in return
    //will trigger the _layer* functions
    _add: function(map,layer) {
        map.layers(layer);
    },

    _remove: function(layer) {
        layer.remove();
    },

    _position: function(layer, pos) {
        layer.position(pos);
    },

    _visible: function(layer, vis) {
        layer.visible(vis);
    },

    _opacity: function(layer,opac) {
        layer.opacity(opac);
    },

    //functions that change the widget
    _layerAdded: function(widget, layer) {
        widget = widget.children('.ls-layermanager-content');
        var self = this;
        var error = layer.legend().msg;
        var url;
        switch(error){
            case '':
                url =layer.legend().url;
                if(url==''){error='No legend for this layer';}
                break;
            case 'E_ZOOMOUT':
                error = 'Please zoom out to see this layer';
                break;
            case 'E_ZOOMIN':
                error = 'Please zoom in to see this layer';
                break;
            case 'E_OUTSIDEBOX':
                error = 'This layer is outside the current view';
                break;
        }

        var layerElement = $.tmpl('lsLayerManagerElement',{
            id: layer.id,
            label: layer.label,
            position: layer.position(),
            visible: layer.visible(),
            imgUrl: url,
            opacity: layer.visible()?layer.opacity():0,
            errMsg: error
        })
            // save layer layer in the DOM, so we can easily
            // hide/show/delete the layer with live events
            .data('layer', layer)
            .data('self',self)
            .prependTo(widget);

       $(".ls-layermanager-element-slider", layerElement).slider({
           max: 100,
           step: 1,
           value: layer.visible()?layer.opacity()*100:0,
           slide: function(event, ui) {
               var layer = layerElement.data('layer');
               var self =  layerElement.data('self');
               self._opacity(layer,ui.value/100);
           },
           //using the slide event to check for the checkbox often gives errors.
           change: function(event, ui) {
               var layer = layerElement.data('layer');
               var self =  layerElement.data('self');
               if(ui.value>=0.01) {
                   if(!layer.visible()){layer.visible(true);}
               }
               if(ui.value<0.01) {
                   if(layer.visible()){layer.visible(false);}
               }
           }
       });
    },

    _layerRemoved: function(widget, id) {
        var control = $("#ls-layermanager-element-"+id);
        control.fadeOut(function() {
            $(this).remove();
        });
    },

    _layerPosition: function(widget, layer) {
        var layerNodes = widget.element.find('.ls-layermanager-element');
        var num = layerNodes.length-1;
        var tmpNodes = [];
        tmpNodes.length = layerNodes.length;
        layerNodes.each(function() {
            var layer = $(this).data('layer');
            var pos = num-layer.position();
            tmpNodes[pos]= this;
        });
        for (i=0;i<tmpNodes.length;i++) {
            layerNodes.parent().append(tmpNodes[i]);
        }
    },

    _layerVisible: function(widget, layer) {
        var layerElement =
        widget.element.find('#ls-layermanager-element-'+layer.id);
        var checkbox =
        layerElement.find('.ls-layermanager-element-vischeckbox');
        checkbox[0].checked = layer.visible();
        //update the opacity slider as well
        var slider = layerElement.find('.ls-layermanager-element-slider');
        var value = layer.visible()?layer.opacity()*100: 0;
        slider.slider('value',value);

        //update legend image
        layerElement.find('.ls-layermanager-element-legend img').css(
            {visibility:layer.visible()?'visible':'hidden'});
    },

    _layerOpacity: function(widget, layer) {
        var layerElement = widget.element.find(
            '#ls-layermanager-element-'+layer.id);
        var slider = layerElement.find(
            '.ls-layermanager-element-slider');
        slider.slider('value',layer.opacity()*100);
        //update legend image
        layerElement.find(
            '.ls-layermanager-element-legend img').css(
            {opacity:layer.opacity(),visibility:layer.visible()?'visible':'hidden'});
    },

    _moveEnd: function (widget,lmElement,map) {
        lmElement.children('.ls-layermanager-content').empty();
        $.each(map.layers().reverse(), function(){
           widget._layerAdded(lmElement, this);
        });
    },

    //functions bind to the map events
    _onLayerAdd: function(evt, layer) {
        evt.data.widget._layerAdded(evt.data.control,layer);
    },

    _onLayerRemove: function(evt, layer) {
        evt.data.widget._layerRemoved(evt.data.control,layer.id);
    },

    _onLayerChange: function(evt, layer, property) {
         switch(property) {
            case 'opacity':
                evt.data.widget._layerOpacity(evt.data.widget,layer);
            break;
            case 'position':
                evt.data.widget._layerPosition(evt.data.widget,layer);
            break;
            case 'visibility':
                evt.data.widget._layerVisible(evt.data.widget,layer);
            break;
        }
    },
    _onMoveEnd: function(evt) {
        evt.data.widget._moveEnd(evt.data.widget,evt.data.control,evt.data.map);
    }
});
})(jQuery);