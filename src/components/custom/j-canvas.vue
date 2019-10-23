
<template>
<div :style="styleComponent">
  <canvas ref="canvas" :width='myPixelWidth' :height='myPixelHeight'></canvas>
  <!-- {{ msg }} {{ debug }}-->

</div>
</template>

<script>
/* eslint-disable */
import { extend } from 'quasar'
import MoeUtils from '../../moe/utils/moe.utils.js'

export default {
  name: 'j-canvas',

  components: { },

  props: {
    id: {
      type: String,
      default: 'NOID'
    },
    width: {  // display width
      type: String,
      default: '100%'
    },
    height: { // display height
      type: String,
      default: '100%'
    },
    pixelWidth: { // canvas pixels
      type: Number,
      default: 256
    },
    pixelHeight: { // canvas pixels
      type: Number,
      default: 256
    },
    value: {
      type: [Object, Array, ImageData, Image, HTMLCanvasElement]
    },
    responsive: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      ctx: null,
      msg: '',
      myPixelWidth: 256,
      bitmap: null
    }
  },

  computed: {
    debug () {
      return myImageData ? myImageData.slice(0,10) : 'undefined'
    },
    myImageData () {
      let v = this.value
      console.log('compute CANVAS myValue AND set myImageData and RENDER from value =>', v)
      if (!v) {
        return undefined
      }
      if (typeof v === ImageData) {
        return extend({}, v)
      }
    },
    styleComponent () {
      return {
        width: this.width,
        height:  this.showPalette ? this.height * 2 : this.height
      }
    },
    myPixelHeight () {
      return this.showPalette ? 256 : 256
    }
  },
  watch: {
    value: {
      handler (newVal) {

        if (!this.responsive) return
        console.log( '(⌐■_■) Canvas#' + this.id + '.value ==> ', typeof(newVal), newVal)

        let imgData
        let msg
        // undefined / empty
        if (!newVal) {
          msg = 'undefined'
          imgData = MoeUtils.imageDataEmpty()
        }

        else if (newVal instanceof HTMLCanvasElement) {          
          msg = "HTMLCanvasElement"
          imgData = newVal.getContext('2d').getImageData(0, 0, 255, 255)
        }

        // Fabric Object? (just check for canvas, so far)
        else if (newVal.canvas) {
          msg = "FabricObject"
          imgData = newVal.canvas.getContext('2d').getImageData(0, 0, 255, 255)
        }

        // ImageData
        else if (newVal instanceof ImageData) {
          msg = 'ImageData'
          imgData = newVal //extend({}, newVal)
        }

        // Array (of colors)
        else if (Array.isArray(newVal) && newVal.length <= 256) {
          msg = 'Array'
          imgData = MoeUtils.imageDataFromColors(newVal)
        }

        // pixels & colors
        else if (newVal.pixels && newVal.colors) {
          msg = 'Pixels & Colors'
          imgData = MoeUtils.imageDataFromPixelsAndColors(newVal)
        }

        // bitmap
        else if (newVal.pixels && newVal.palette) {
          msg = 'bitmap'
          imgData = MoeUtils.imageDataFromBitmap(newVal)
        }

        // Colors Only (render palette preview)
        else if (newVal.colors) {
          msg = '.colors'
          imgData = MoeUtils.imageDataFromColors(newVal.colors)
        }

        // Pixels Only (render pixels in greyscale)
        else if (newVal.pixels) {
          msg = '.pixels'
          imgData = MoeUtils.imageDataFromPixels(newVal.pixels)
        }

        // Array of pixels
        else if (newVal.length === 65536) {
          msg = 'Array of pixels (render greyscal)'
          imgData = MoeUtils.imageDataFromPixels(newVal)

        }

        // unknown
        else {
          msg = 'unknown'
          imgData = MoeUtils.imageDataEmpty()
        }

        // console.log(this.id + ' CANVAS TYPE: *' + msg + '*')

        this.msg = msg
        this.$nextTick(function() {
          this.putImageData(imgData)
        })

      },
      immediate: true
    },
    // Data input Prop Types:
    //
    imageData: {
      handler (newVal) {
        //console.log("watch CANVAS imageData->", newVal)
        //this.updateImage(newVal)
      },
      immediate: false
    }
  },
  methods: {

    putBitmap (bitmap) {
      console.log(MoeUtils.imageDataFromBitmap(bitmap))
    //  this.putImageData(MoeUtils.imageDataFromBitmap(bitmap))
    },
    putImageData (imgData) {
      // const imageData = this.myImageData
      // console.log('UPDATE IMAGEDATA', imgData)
      if (imgData instanceof ImageData) {
        this.ctx.putImageData(imgData, 0, 0)
        // this.myImageData = this.ctx.getImageData(0, 0, this.pixelWidth, this.pixelHeight)
      }
      else {
        // draw error on canvas
        this.ctx.fillStyle = 'white'
        this.ctx.fillRect(0, 0, 256, 256)
        this.ctx.fillStyle = 'red'
        this.ctx.font = '30px Comic Sans MS'
        this.ctx.textAlign = 'center'
        this.ctx.fillText('No ImgData', 128, 128)
      }

    },
    // get canvas FROM...
    fromImageData (imageData) {

      // this.myImageData = imageData
      // this.putImageData()
    },
    fromRGBA (rgba) { // @rgba = UInt8Array
      for (var i = 0, l = rgba.length; i < l; i++) {
        this.myImageData.data[i] = rgba[i]
      }
      this.putImageData()
    },
    fromImage (img) {
      console.log('j-canvas.fromImage() with ', img)
      this.ctx.drawImage(0, 0, this.pixelWidth, this.pixelHeight)
      this.imageData = this.ctx.getImageData(0, 0, this.pixelWidth, this.pixelHeight)
      this.putImageData()
    },
    // GET from canvas...
    getCanvas () {
      return this.$refs.canvas
    },
    getImageData () {
      return this.myImageData
    },
    getImage () {
      return null
    },
    getRGBA () {
      return null
    }
  },
  ready () {
    this.test1 = 'test1'
  },
  mounted () {
    this.ctx = this.$refs.canvas.getContext('2d')
    // this.myImageData = this.ctx.getImageData(0, 0, this.pixelWidth, this.pixelHeight)
  }
}
</script>

<style lang="stylus">
  canvas
    width 100%
    height 100%
</style>
