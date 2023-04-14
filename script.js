/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/


/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
//Define access token
mapboxgl.accessToken = 'pk.eyJ1Ijoiemd5NjY3NyIsImEiOiJjbGRtMHNzd2owNHJ1M3hxZmw0MTFkNnY3In0.G3OzgVvqC8WutLmLNhjGXw'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

//Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', //container id in HTML
    style: 'mapbox://styles/mapbox/streets-v12',  //****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 12 // starting zoom level
});

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
//      Use the fetch method to access the GeoJSON from your online repository
//      Convert the response to JSON format and then store the response in your new variable
let collisgeojson;
fetch('https://raw.githubusercontent.com/zgy6677/472lab4/main/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        collisgeojson = response;
        // console.log(collisgeojson)    // check if fetch works
    });
    
    map.on('load', () => {

        map.addSource('pedcyc-collis', { 
            type: 'geojson',
            data: collisgeojson    
        });

/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data then store as a feature collection variable
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function


        console.log(collisgeojson)    // check if fetch works

        var bbox = turf.bbox(collisgeojson);
        var bboxPolygon = turf.bboxPolygon(bbox);// create bounding box

        // // adding boundingbox layer
        // map.addSource('bbp', {
        //     'type': 'geojson',
        //     'data': bboxPolygon
        // })

        // map.addLayer({
        //     'id': 'bpolygon',
        //     'type': 'fill',
        //     'source': 'bbp',
        //     'paint':{
        //         'fill-color': 'red',
        //         'fill-opacity': 0.3
        //     }
        // });

        // set up hex grid

        var cellSide = 1;
        var options = {units: 'kilometers'};
        var hexgrid = turf.hexGrid(bbox, cellSide, options);

        console.log(hexgrid) // debug use

        // adding hexgrid layer
        map.addSource('hex', {
            'type': 'geojson',
            'data': hexgrid
        })

        map.addLayer({
            'id': 'hexgrid',
            'type': 'fill',
            'source': 'hex',
            'paint':{
                'fill-color': 'orange',
                'fill-opacity': 0.3,
                'fill-outline-color': 'red'
            }
        });

/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty

        var pts = collisgeojson
        var polys = hexgrid
        var collected = turf.collect(polys, pts, '_id', 'values')
        var values = collected.features[0].properties.values  // change feature index to show intected points
        var numb = values.length
        console.log(numb)


// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows

        // add pop-up window

        map.on('click', 'hexgrid', (e) => {

            var collected = turf.collect(e, pts, '_id', 'values')
            var values = collected.features[0].properties.values  // change feature index to show intected points
            var numb = values.length
            console.log(numb)

            new mapboxgl.Popup() 
                .setLngLat(e.lngLat) 
                .setHTML("<b>Collisions in Boundary: </b> " + numb + "<br>" )
                .addTo(map); //Show popup on map
        });


        map.addLayer({  
            'id': 'pedcyc-collis-pnts',
            'type': 'circle',
            'source': 'pedcyc-collis',
            'paint': {
                'circle-radius': 3,
                'circle-color': 'blue'
            }
        });
    });

    // console.log(collisgeojson)    // check if fetch works debug use



