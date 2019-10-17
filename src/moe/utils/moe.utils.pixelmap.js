
Conversation opened. 1 read message.

Skip to content
Using Gmail with screen readers
26 of 3,112

MAP
Inbox
x

Jon May <cookie.jon@gmail.com>
Feb 21 (6 days ago)
to me
/**
 *
 *   LEVEL
 *
 */



/**
 *
 *    PIXEL MAP
 *
 */

var PixelMap = (function(w, h, seed ) {

  var w=256, h=256,

  numberedArray = new Uint16Array(65536),

  test = function(a) {

    return "HI THERE";

  },

  generatePixelMap = function(seed) {

    // Populate a sequentially numbered array
    //
    console.log("GENERATING PIXEL MAP " + numberedArray.length);

    for (var i = 0, l = numberedArray.length; i < l; i++) {

      numberedArray[i] = i;

    }

    console.log("numbered 1" , numberedArray);

    // some random shifts
    for (t = 0; t< 100; t+=25) {
      numberedArray.set(shiftPixels(0 + t, 0, 255-t, 256, 2, 20),0);

    }
    for (t = 0; t< 100; t+=15) {
      numberedArray.set(shiftPixels(0, 0 + t, 256, 255-t,  3, 20),0);

    }



    // Reverse the mixed-up numbered array into a map
    //
    Mapper.startMapping();

    for (var i=0; i<65536; i++ ) {

      var fromIndex = numberedArray[i];
      var toX = i%256;
      var toY = parseInt(i/256);

      Mapper.addMapping(fromIndex, [toX, toY]);

      //Mapper.mappedCoords.set( [toX, toY] , fromIndex * 2 );

    }
  },

  shiftPixels = function(x1, y1, x2, y2, direction, amount) {

    var w = 256;
    var h = 256;

    var w1 = x2-x1;
    var h1 = y2-y1;

    var shifts = [[0,-1],[1,0],[0,1],[-1,0]];

    var xOffset = shifts[direction][0] * amount;
    var yOffset = shifts[direction][1] * amount;

    var tmp = Uint16Array.from(numberedArray);

    // shift x1,y1-x2,y2 by N in direction D
    //
    for (var y = y1; y<y2;y++) {
      for (var x = x1; x<=x2;x++) {

        var fromIndex = x + y * 256;
        var toIndex = ( ( x + xOffset + 256 ) % 256 ) + ( ( ( y+yOffset + 256 ) % 256 ) * 256 );

        tmp[toIndex] = numberedArray[fromIndex];

      }
    }

    return tmp;

  };


  return {

    test: test,
    generatePixelMap: generatePixelMap,
    shiftPixels: shiftPixels

  }




})();



 var orphans = [];

 function Mapper() {

  console.log("Created Mapper");

 }


Mapper.tmpPixels = new Uint8Array(65536); // 256*256*(colorIndex)
Mapper.imageData;
Mapper.mappedCoords = new Uint8Array(65536*2); // 256*256 (X,Y)
// ^ replace with... TODO
Mapper.pixelMap = new Uint16Array(65536*2); // 256*256 (X,Y)

Mapper.mappedColors = new Uint8Array(65536); // 256 (shift color)  (i.e. a normal bitmap)
Mapper.lastIndexFrom = 0;
Mapper.colorImageData;


/**
* Map Pixels
*/
Mapper.map = function(pixels) {

  console.log("Map pixels ", pixels, "Orphans ", orphans.length);

  _uint8ArrayToUint8Array(pixels, Mapper.tmpPixels);

  for (var i=0; i<65536; i++ ) {

    pixels[Mapper.mappedCoords[i*2]+256*Mapper.mappedCoords[i*2+1]] = Mapper.tmpPixels[i];

  }

  return pixels;

}

/**
* Map Colors
*/
Mapper.mapColor= function(pixels) {

  console.log("Map colors ");

  _uint8ArrayToUint8Array(pixels, Mapper.mappedColors);

  for (var i=0; i<65536; i++ ) {

    pixels[Mapper.mappedCoords[i*2]+256*Mapper.mappedCoords[i*2+1]] = Mapper.tmpPixels[i];

  }

  return pixels;

}

/**
* Unmap Pixels
*/
Mapper.unmap = function(pixels) {

  console.log("Unmap pixels ", pixels);

  _uint8ArrayToUint8Array(pixels, Mapper.tmpPixels);

  for (var i=0; i<65536; i++ ) {

    pixels[i] = Mapper.tmpPixels[Mapper.mappedCoords[i*2]+256*Mapper.mappedCoords[i*2+1]];

  }

  return pixels;

}



/**
* Returns imageData defining the mapped coords, where for every pair of mapped coords:
*
*   R=coord1.x
*   G=coord1.y
* B=coord2.x
* A=coord2.y
*/
Mapper.getImageData = function(map) {

  console.log("Get image from map ");

  if (map === undefined) map = Mapper.mappedCoords;

  var data = Mapper.imageData.data;

  orphans = [];

  for (var i = 0; i < 65536;) {

    var imgIndex = i*4;

    data[imgIndex++]  = Math.clamp(map[i++],0,255);
    data[imgIndex++]  = Math.clamp(map[i++],0,255);
    data[imgIndex++]  = Math.clamp(map[i++],0,255);
    data[imgIndex]    = Math.clamp(map[i++],0,255);

  }

  return Mapper.imageData;

}



Mapper.getColorImageData = function(map) {


  return Mapper.colorImageData.data;;

}



/**
 *
 *   MAP FUNCTIONS FOR DESIGN USE ONLY
 *
 */



/**
 *  Reset, ready to generate a new map.
 *
 */
Mapper.startMapping = function() {

  Mapper.tmpPixels.fill(0);
  Mapper.imageData.data.fill(0);
  Mapper.mappedCoords.fill(0);
  orphans = [];
  Mapper.lastIndexFrom = 0;
  console.log("START MAPPING:", Mapper.tmpPixels);
}

Mapper.startColorMapping = function() {

  Mapper.tmpPixels.fill(0);
  Mapper.imageData.data.fill(0);
  Mapper.mappedCoords.fill(0);
  orphans = [];
  Mapper.lastIndexFrom = 0;
  console.log("START MAPPING:", Mapper.tmpPixels);

}


/**
 *  Add a new mapped pixel to this mapper:
 *
 */
Mapper.addMapping = function(a, b) {

  // Either:  "map to a"  or  "map from a to b"
  //
  var mapFrom = (arguments.length > 1) ? a : null;
  var mapTo = (arguments.length > 1) ? b : a;

  //console.log("From", mapFrom, "To", mapTo);

  // Need from as index
  //
  var fromIndex = (mapFrom == null) ? this.lastIndexFrom++ :  Array.isArray(mapFrom) ? (mapFrom[0]+mapFrom[1]*256) : mapFrom;

  // Need to as coords
  //
  var toCoords = Array.isArray(mapTo) ? mapTo : [mapTo%256,parseInt(mapTo/256)];

  //console.log("fromIndex", fromIndex, "toCoords", toCoords);

  // Check for orphans or out of bounds (TODO: Make this better!!)
  if (
    toCoords[0] < 0 || toCoords[0] >255 ||
    toCoords[1] < 0 || toCoords[1] >255 ||
    fromIndex <0 || fromIndex > 65535 ) {

    orphans.push([fromIndex,[toCoords[0],toCoords[1]]]);

  } else {

    // Add Mappng
    //
    //console.log(fromIndex, toCoords, Mapper.mappedCoords);
    Mapper.mappedCoords.set(toCoords, fromIndex*2)

  }


}



/**
 *    Generate a mapper from a custom function (see below)
 */
Mapper.generateColorMap = function(pixels) {
  if (pixels === undefined || pixels == null) return null;
  console.log("Generated colormap");
  this.mappedColors.set(pixels);
  return pixels;

}

/**
 *    Generate a mapper from a custom function (see below)
 */
Mapper.generateMap = function(sName) {

  //if (theBitmap === null) {
  //  console.log("Can't generate Mapper... Load a bitmap first!");
  //  return;
  //}

  switch(sName) {

    case "Spiral":
       Mapper.generateMap_spiral();
      break;

    case "Squares":
      //Mapper.startMapping();
      PixelMap.generatePixelMap();
      //return Mapper.generateMap_squares();
      break;

    default:
      console.log("Unknown Map name: '"+sName+'"');
      break;

  }


}



Mapper.generateMap_spiral = function(res, order) {



 // Spiral ->

  Mapper.startMapping();
  var spiralLength = 1;
  var spiralLengthSoFar = 0;
  var direction = 2; //down
  var tick = 0;
  var mini4 = 0;
  var x = 126;
  var y = 126;
  var index2 = 0;
  var mappedIndex;
  var theColor;
  var val;
  ////var pixels = Uint8Array.from(this.pixels_key);

  //slidingSpeedPower
  //for (var index = slidingSpeedPower; index>-1; index--) {
  //for (var index = slidingCurrent.length-1; index>-1; index--) {
  //for (var index = 0; index < slidingCurrent.length; index++) {

  for (var index = 0; index <65536; index++) {
    var tx = x;
    var ty = y;

    switch(mini4) {
        case 1:
          ty--;
          break;
        case 2:
          ty--;
          tx++;
          break;
        case 3:
          tx++;
          break;
      }



    mappedIndex = tx+256*ty;

    Mapper.addMapping(mappedIndex);

    mini4++;
    mini4 = mini4%4;
    //mini4 = 3;
    if (mini4==3) {
      if (direction==0) y-=2;
      if (direction==1) x+=2;
      if (direction==2) y+=2;
      if (direction==3) x-=2;
      spiralLengthSoFar++;

      if (spiralLengthSoFar==spiralLength) {
        tick++;
        if (tick==2) {
          // increase length every 2 turns
          tick=0;
          spiralLength++;
        }
        // turn left
        spiralLengthSoFar=0;
        direction= (direction +3)%4;
      }
    }
  }





 // NEW
 /*
  Mapper.startMapping();

  var resolution = (res || 128);    // pixels per mini-square (256 = 1 spiral, 128 = 2x2, 64 = 4x4, etc.)
  var order = (order || 0);     // 0 = sequential, 1 = staggered
  order = 0;
  resolution = 256;
  var spiralLength = 1;
  var spiralLengthSoFar = 0;
  var direction = 2; //down
  var tick = 0;
  var mini4 = 0;
  var x = resolution/2;
  var y = resolution/2;
  var index2 = 0;
  var mappedIndex;
  var theColor;
  var val;
  ////var pixels = Uint8Array.from(this.pixels_key);

  //slidingSpeedPower
  //for (var index = slidingSpeedPower; index>-1; index--) {
  //for (var index = slidingCurrent.length-1; index>-1; index--) {
  //for (var index = 0; index < slidingCurrent.length; index++) {

  var mul = 256/resolution/2;

  var stride = (resolution * resolution) * mul *2;

  for (var index = 0; index <(65536); index++) {
    var tx = x;
    var ty = y;

    switch(mini4) {
        case 1:
          ty--;
          break;
        case 2:
          ty--;
          tx++;
          break;
        case 3:
          tx++;
          break;
      }



    //mappedIndex = tx+256*ty;
    var tmp = index;
    for (var i=0; i< mul; i++) {

      switch (order) {
        case 0:
          // Opposites
          Mapper.addMapping(65535-(tmp*2), [tx, ty]);
          Mapper.addMapping(65535-(tmp*2+1),  [tx+127, ty]);
          Mapper.addMapping(0 + (tmp*2),  [tx, ty+127]);
          Mapper.addMapping(0 + (tmp*2+1),  [tx+127, ty+127]);
          break;

        default:
        case 1:
          // Staggered
          Mapper.addMapping(65535 - (((i * resolution/2) + index) % 65536), [tx + (resolution * i) % 256, ty + (resolution * i) % 256]);
          //Mapper.addMapping(65535 - (((i * resolution) + index) % 65536), [tx + , ty]);
          break;

      }

    }


    mini4++;
    mini4 = mini4 % 4;

    if (mini4==3) {
      if (direction==0) y-=2;
      if (direction==1) x+=2;
      if (direction==2) y+=2;
      if (direction==3) x-=2;
      spiralLengthSoFar++;

      if (spiralLengthSoFar==spiralLength) {
        tick++;
        if (tick==2) {
          // increase length every 2 turns
          tick=0;
          spiralLength++;
        }
        // turn left
        spiralLengthSoFar=0;
        direction= (direction +3)%4;
      }
    }
  }
*/

 }



Mapper.generateMap_squares = function(options) {



  /* Default options:


  Mapper.startMapping();
  for (var i=0; i<65536; i++) {
    Mapper.addMapping(i);
  }


 */


 // Spiral ->




  var o = $.extend({
          chunkWidth: 128,
          chunkHeight: 128,
          coarseSpreadX: 1,
          coarseSpreadY: 0,
          fineSpreadX: 1,
          fineDpreadY: 0,
          isProgressive: true}
        , options );

  var w = 256;
  var h = 256;

  var chunk_w = o.chunkWidth;
  var chunk_h = o.chunkHeight;

  var chunks_x = w / chunk_w;
  var chunks_y = h / chunk_h;

  var chunk_area = chunk_w * chunk_h;
  var chunk_stride = chunk_area * chunks_x;

  var index = 0;
  var mappedIndex = 0;

  Mapper.startMapping();

  // A. Progressive fill (all chunks a bit at a time)
  //
  for (var x = 0; x< chunk_w; x++) {    // XX FINE | FILLE chunk's X

    for (var y = 0; y< chunk_h; y++) {  // YY FINE | FILLE chunk's Y

      for (var xx = 0; xx< chunks_x; xx++) {    // COARSE Find next chunk across

        for (var yy = 0; yy< chunks_y; yy++) {   // COARSE Find next chunk down.

          //mappedIndex = ((x * chunk_w + xx) + (y * chunk_stride) + (yy * w));

          //  (((x * chunks_x)  + (chunk_w + (xx + options.fineSpreadX) % chunk_w) + (y * chunk_stride) + (yy * w);

          var xComponent;
          var yComponent;

          xComponent = (xx + o.coarseSpreadX) * chunk_w % w;
          xComponent += (x + (o.fineSpreadX * chunk_w) % chunk_w);

          yComponent = (yy * o.coarseSpreadY) * chunk_h % h;
          yComponent += (y + (o.fineSpreadY * chunk_h) % chunk_h);

          Mapper.addMapping([xComponent, yComponent]);


        }

      }

      //console.log(index);

    }

  }

 }


Click here to Reply or Forward
1.22 GB (8%) of 15 GB used
Manage
Terms - Privacy
Last account activity: 1 hour ago
Details


+