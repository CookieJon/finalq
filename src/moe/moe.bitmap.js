/**
 *
 * DEPRECATED!!!  Refer to moe.object.bitmap instead
 *
 */

exports.Bitmap = Bitmap

function Bitmap () {

  this._type = 'Bitmap'

  this.title = 'Untitled'

  this.source = null

  this.width = null //     256
  this.height = null // x   256
  this.length = null // = 65535

  this.pixels_key = null // Original pixels
  this.palette_key = null // Original palette
  this.imageData_key = null // context.getImageData(0,0,this.width, this.height).data

  this.pixels = null // Uint8Array[.length]   Output/used pixels
  this.palette = null // Uint8Array[256]     Output/used palette
  this.ximageData = null // context.getImageData(0,0,this.width, this.height).data

  this.stats = {
    tags: null,
    colors: null,
    noiseLevel: null,
    average: null,
    high: null,
    low: null
  }
}

Bitmap.prototype = {

  constructor: Bitmap,

  init: function () {
    // this.imageData = new ImageData(this.width, this.height)
  },

  /*
  BMP
  --==FILE_HEADER: 14 bytes
  0   2=19778 (BM) bfType	2	The characters "BM"
  2   4=66614    bfSize	4	The size of the file in bytes
  6   2=0        bfReserved1	2	Unused - must be zero
  8   2=0        bfReserved2	2	Unused - must be zero
  10  4=1078     bfOffBits	4	Offset to start of Pixel Data
  --==IMAGE_HEADER: 40 bytes
  14  =40       biSize	4	Header Size - Must be at least 40
  18  =256      biWidth	4	Image width in pixels
  22  =256      biHeight	4	Image height in pixels
  26  =1        biPlanes	2	Must be 1
  28  =8        biBitCount	2	Bits per pixel - 1, 4, 8, 16, 24, or 32
  30  =0        biCompression	4	Compression type (0 = uncompressed)
  34  =65536    biSizeImage	4	Image Size - may be zero for uncompressed images
  38  =2834     biXPelsPerMeter	4	Preferred resolution in pixels per meter (18)
  42  =2834     biYPelsPerMeter	4	Preferred resolution in pixels per meter (18)
  46  =256      biClrUsed	4	Number Color Map entries that are actually used (256)
  50  =256      biClrImportant	4	Number of significant colors
  --==COLOR_TABLE:
  54  =256*[BGR0]
  --== PIXEL_DATA:
  1078 =65536*1vt
  */

  toArrayBuffer: function toArrayBuffer(pixels, palette, filename) {
    var buffer = new ArrayBuffer(66614)
    var dataView = new DataView(buffer)
    // File Header
    dataView.setUint16(0, 19778) // BM
    dataView.setUint32(2, 66614) // size of file
    dataView.setUint8(6, 0)
    dataView.setUint8(8, 0)
    dataView.setUint32(10, 1078) // Offset to pixeldata
    // Image Header
    dataView.setUint32(14, 40)
    dataView.setUint32(18, 256)
    dataView.setUint32(22, 256)
    dataView.setUint8(26, 1)
    dataView.setUint8(28, 8)
    dataView.setUint32(30, 8)
    dataView.setUint32(34, 65536)
    dataView.setUint32(38, 2834)
    dataView.setUint32(42, 2834)
    dataView.setUint32(46, 256)
    dataView.setUint32(50, 256)
    // Palette
    let offset = 54
    for (i=0;i++<256;) {
      let c = palette[i]
      dataView.setUint8(offset, c.b)
      dataView.setUint8(offset+1, c.b)
      dataView.setUint8(offset+2, c.r)
      offset += 4
    }
    // Pixels
    offset = 1078
    for (y = 256; y-- >= 0;) {
      for (x = 0; x++ < 256;) {
        dataView.setUint8(offset++, pixels[x + y * 256])
      }
    }

    // Save File
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    let
      blob = new Blob(data, {type: 'octet/stream'}),
      url = window.URL.createObjectURL(blob)
    
      a.href = url
      a.download = filename
      a.click()
      window.URL.createObjectURL(url)

  },

  fromArrayBuffer: function fromArrayBuffer (srcArrayBuffer) {
    // bitmap stream
    var dataview = new DataView(srcArrayBuffer)
    var offBits = dataview.getUint16(10, true)
    this.width = dataview.getUint32(18, true)
    this.height = dataview.getUint32(22, true)
    var bitCount = dataview.getUint16(28, true)
    // var totalColors = dataview.getUint16(46, true)
    var usedColors = dataview.getUint16(50, true)

    // pixels
    this.length = this.width * this.height
    this.pixels_key = new Uint8Array(this.length)
    for (var y = 0; y < 256; y++) {
      for (var x = 0; x < 256; x++) {
        this.pixels_key[x + y * 256] = dataview.getUint8(offBits + x + (255 - y) * 256) // Invert Y axis (BMP8 data goes from bottom->top)
      }
    }
    this.pixels = Uint8Array.from(this.pixels_key)

    // palette
    var length = bitCount === 0 ? 1 << bitCount : usedColors
    // var index = 54
    var tmpPalette = []
    for (var i = 0; i < length; i++) {
//      var b = dataview.getUint8(index++)
//      var g = dataview.getUint8(index++)
//      var r = dataview.getUint8(index++)
//      var a = dataview.getUint8(index++)

      // tmpPalette.push(Palette.getColorFromRGBA(r, g, b, a))
    }
    this.palette_key = tmpPalette
    this.palette = Array.from(tmpPalette)

    return this
  },

  fromFile: function fromFile (srcFile, callback) {
    var file = srcFile
    var reader = new FileReader()
    var title = file.name.replace(/\.bmp|_/g, '').toSentenceCase()
    var bitmap = this(function (reader, title) {
      reader.addEventListener('load', function (e) {
        bitmap.fromArrayBuffer(e.target.result)
        bitmap.title = title
        bitmap.init()
        callback(bitmap)
      }, false)
      reader.readAsArrayBuffer(file) // for BMP8 raw file
      // reader.readAsDataURL(file)  // for Image() object
    })(reader, title)
    return this
  },

  fromFileName: function fromFileName (filename, callback) {
    // Load bitmap programatically
    //
    var oReq = new XMLHttpRequest()
    oReq.open('GET', filename, true)
    oReq.responseType = 'arraybuffer'
    oReq.onload = function (oEvent) {
      var arrayBuffer = oReq.response // Note: not oReq.responseText
      if (arrayBuffer) {
        // var byteArray = new Uint8Array(arrayBuffer)
        var bitmap = new Bitmap().fromArrayBuffer(arrayBuffer)
        bitmap.title = filename.slice(-8).replace(/\.bmp|_/g, '').toSentenceCase()
        bitmap.init()
        callback(bitmap)
      }
    }
    oReq.send(null)
  },

  // OUTPUT
  //
  render: function render () {
    this.generateImageData(this.pixels, this.palette, this.imageData)
  },

  generateImageData: function generateImageData (pixels, palette, imageData) {
    // quick method just for the key image with no mapping etc.
    //
    var data = imageData.data

    var mapToIndex = 0

    for (var i = 0; i < 65535; i++) {
      var theColor = this.palette_key[pixels[i]]

      data[mapToIndex++] = theColor.r
      data[mapToIndex++] = theColor.g
      data[mapToIndex++] = theColor.b
      data[mapToIndex++] = 255
    }

    return imageData
  }

}

