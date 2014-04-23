/*L.CRS.EPSG2180 = new L.Proj.CRS('EPSG:2180',
  '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
  ,{scales:[200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 530, 310, 165, 80]});*/

var bbox = [148212.529999998, 111513.216832546, 885576.855272055, 803675.779999998];
var transformation = new L.Transformation(1, -bbox[0], -1, bbox[3]);

 /*var crs = new L.Proj.CRS( 'EPSG:2180',
 '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', {transformation,
 scales:[200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 530, 310, 165, 80]});*/

var crs = new L.Proj.CRS('EPSG:2180',
    '+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    bbox,
    {
        resolutions: [
           140000.0000000000,
            70000.0000000000,
            35000.0000000000,
            17500.0000000000
        ],
        transformation: transformation,
    }
);