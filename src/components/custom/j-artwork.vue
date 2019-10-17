<template lang="pug">


  div
    //-  PREVIEW (w.bitmsp2 branch)
    j-panel(icon='business', :title='value.name + " Preview"', :width='600', :height='800', :x='600', :y='5')
      div.j-tray.area.panel-item-grow(slot='content')
        div.rowx
          div(:class='value.options.frame')
            div.picture-mat
              div.picture-art
                canvas(ref='preview', @click="clickPreview", width='256', height='256', style='width:100%;height:100%;')
                //- j-canvas.frame-type-grid(:image-data='filterFinalImageData')

    //- SETTINGS
    j-panel(icon='business', :title='value.name', :width='400', :height='850', :x='195', :y='5')
      div.j-tray.area.panel-item-grow(slot='content')

        //- LEVER
        q-card(color='dark')
          q-card-main.row
              j-lever(v-model='controlTargetPower', rest='50%', :markers='true',
                :labelAlways='true',
                orientation='vertical',
                @start='__startSliding',
                @stop='__stopSliding',
                :range={
                  'min': -10000,
                  '35%': -1200,
                  '45%': -100,
                  '50%': 0,
                  '55%': 100,
                  '65%': 1200,
                  'max': 10000
                }
              )
        q-scroll-area(style="height: 800px" :thumb-style="{right: '4px',borderRadius: '2px',background: 'black',width: '5px', opacity: 1}"  :delay="1500")

          //- SPEEDMAP
          q-card(color='dark')
            q-card-main
              div.row
                |SPEEDMAP
              div.row
                div.col-11
                  //- q-select(dark, v-model='slidingSpeedsPattern', :options='presetSlidingSpeedOptions')
                  q-input.col(stack-label='Sliding Speeds Pattern', dark, v-model='slidingSpeedsPattern')
                div.col-1
                  q-btn(small,push,ref='target')|?
                    q-popover(ref='popover')
                      q-list(separator,link,style="min-width: 100px")
                        q-item(
                          v-for="(n, i) in presetSlidingSpeedOptions",
                          :key='i',
                          @click='slidingSpeedsPattern=presetSlidingSpeedOptions[i].value,$refs.popover.close()')
                          q-item-main(:label='n.label')
              div.row
                q-toggle(v-model="myValue.options.slidingLocked", label='Lock')
                q-btn(small,push,@click='changePeriod(-1)')|<
                q-btn(small,push,@click='changePeriod(1)')|>
                q-btn(small,push,@click='changeAmplitude(1)')|+
                q-btn(small,push,@click='changeAmplitude(-1)')|-


          //- FILTERS
          q-card(color='dark')
              q-card-main
                div.row
                  |FILTERS
                div.row
                  q-btn(small push @click='setActiveFilter(-1)')
                    j-canvas(:value='pipelineInit', width='40px' height='40px')
                  q-btn(small push @click='addFilter("slider")')|+ SLD
                  q-btn(small push @click='addFilter("bitmap")')|+ BMP
                  q-btn(small,push,@click='setActiveFilter(-2)')
                    j-canvas(:value='pipelineFiltered', width='40px' height='40px')


                div.row(v-for='filter, i in value.filters' @click='setActiveFilter(i)')
                  q-card(color='dark' :class='i === activeFilter ? "active" : ""')

                    q-card-main(v-if='filter.type === "slider"')
                      div.row
                        |{{i}} SLD
                        
                        j-canvas(:id='"Filter"+i+"Delta"' :value='value.filters[i].delta', width='40px' height='40px')
                        pre(v-html='value.filters[i].pixelSummary')
                        j-canvas(:id='"Filter"+i+"ImageData"' :value='value.filters[i].imageData', width='40px' height='40px')
                        q-btn(small push @click='deleteFilter(i)')|-

                    q-card-main(v-else-if='filter.type === "bitmap"')
                      div.row
                        |{{i}} BMP
                        //- |{{ value.filters[i].pixelsOut }}
                        j-canvas(:id='"Filter"+i+"Delta"' :value='value.filters[i].delta', width='40px' height='40px')
                        j-drop-target(:value='value.filters[i].bitmap', @add='dropBitmapFilter($event, i)', style='width:50px;height:50px;')
                        pre(v-html='value.filters[i].pixelSummary')
                        j-canvas(:id='"Filter"+i+"ImageData"' :value='value.filters[i].imageData', width='40px' height='40px')
                        q-btn(small push @click='deleteFilter(i)')|-
                 
          //- PALETTE
          q-card(color='dark')
            q-card-main.row
              div.col
                div.row
                  |PALETTE
                div.col
                  j-drop-target(:value='myPalette', @add='dropPalette($event)', style='width:80px;height:80px;')
                  q-select(dark, v-model='paletteDDL', :options='paletteOptions')
                  q-select(dark, v-model='myValue.options.frame', :options='frameOptions')
              div.col
                div.row
                  |PIXELMAP
                div.row
                j-drop-target(:value='pixelMapInput', @add='dropPixelMapInput($event)', style='width:80px;height:80px;')

          //- PIXELMAP
          q-card(color='dark')
            q-card-main
              div.row
                |PIXELMAP
              div.row
                div.col
                  j-drop-target(:value='pixelMapInput', @add='dropPixelMapInput($event)', style='width:80px;height:80px;')
                div.col

                        
                div.row


    </q-card-main>
  </q-card-media>

</template>

<script>
/* eslint-disable */
// import Utils from '../../utils'
// import { Utils } from 'quasar'
// import { Platform } from 'quasar'
// const TWEEN = require('es6-tween')

import {QScrollArea, QPopover, QList, QItem, QItemMain, QToggle, QOptionGroup, QBtn, QCard, QCardMain, QCardSeparator, QCardMedia, QCardTitle, QField, QInput, QSelect} from 'quasar'
var jLever = require('components/custom/j-lever')
var jCanvas = require('components/custom/j-canvas')
var jCollection = require('components/custom/j-collection')
var jDropTarget = require('components/custom/j-droptarget')
import Sortable from 'sortablejs'
import { extend } from 'quasar'
var crunch = require("number-crunch");
import ColorUtils from '../../moe/utils/moe.utils.color.js'
import MoeUtils from '../../moe/utils/moe.utils.js'
import Factory from '../../moe/objects/moe.factory.js'
let UID = 10

let
  CURRENT_TIME,
  LAST_TIME = Date.now(),
  ELAPSED_TIME

let
  SLIDING_PIXELS,
  SLIDING_COLORS,
  IMAGEDATA = new ImageData(256, 256)

export default {
  name: "j-artwork",
  components: {
    jCanvas, jLever, jCollection, jDropTarget,
    QScrollArea, QPopover, QList, QItem, QItemMain, QToggle, QOptionGroup, QBtn, QCard, QCardMain, QCardSeparator, QCardMedia, QCardTitle, QField, QInput, QSelect
  },
  props: {
    value: {
      type: Object  // 'moe.objects.artwork' (so far)
    }
  },
  data () {
    return {
      paletteOptions: ColorUtils.presetPalettes.map(v=>{return {'label':v, 'value':v}}),
      frameOptions: [
        {label: 'Classic', value:'picture-frame-classic'},
        {label: 'Modern', value:'picture-frame-modern'},
        {label: 'Minimal', value:'picture-frame-minimal'},
        {label: 'None', value:'picture-frame-none'}
      ],
      aspectOptions: [
        {label: 'Square', value:'picture-aspect-square'},
        {label: 'Portrait', value:'picture-aspect-portrait'},
        {label: 'Landscape', value:'picture-aspect-landscape'}
      ],
      presetSlidingSpeedOptions: [
        '1,2,3,2,1,1,1,1,1,2,3,2',
        '1,1,1,1,1,1,1,1,1,1,1,2,3,4,5,4,3,2,3,4,5,6,7,6,5,4,3,4,5,6,5,4,3,2',
        '1,2,3,4,5,6,7,8,9,8,7,6,5,4,3,2',
        '1,2,3,2,1,2,3,4,5,4,3,2,1,2,3,4,5,6,7,8,9,8,7,6,5,6,7,8,9,10,11,12,13,14,13,12,11,10,9,8,9,10,11,12,11,10,9,8,9,10,11,10,9,8,7,6,7,8,9,8,7,6,5,6,7,8,9,8,7,6,5,4,3,4,5,6,7,8,7,6,5,4,5,6,7,6,5,4,3,2,1',
        '1,2,2,4,4,4,4,4,4,4,4,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8',
        '1,2,3,4,3,5,6,7,8,9,10,9,8,7,6,5,4,5,6,7,8,9,8,7,6,7,8,9,10,11,12,13,14,15'
      ].map(v=>{return {label:v.slice(0,30), value:v}}),

      frameDDL: null,
      paletteDDL: null,
      // myValue: null,
      activeFilter: -1,
      // artwork preview image
      myCtx: null,
      // other contrl previw images...
      //
      // myImageData - computed.
      // myPaletteImageData - computed.
      myPixels: null,
      myPaletteColors: null,
      // >>>><> move to Artwork...!!!!
      bitmap: null,
      palette: null,
      pixels: null,
      // imageData: null,
      pixelMapInput: null,  // greyscale source for generating a pixelmap
      sliderInterval: 10,         // Timeout for continuous press

      // bignum crunching base-256 arrays
      slidingLower: [],
      slidingCurrent: null,
      slidingUpper: [],

      slidingImageData: null, //
      slidingSpeedsImageData: null, // Visual representation of the speed.

      slidingSpeedsPattern: '1,2,3,2,1,1,1,1,1,2,3,2',
      slidingSpeeds: [],
      slidingSpeedsLength: 0,
      slidingSpeedsGradations: 0,

      controlMax: 65536,      // The abs(maximum value of the power?)
      controlTargetPower: 0,	// Current position of the knob
      controlActualPower: 0,  // Smoothstep power wrt TargetPower
      controlPower: 0,        // Current power. I.e. How many significant digits into the 65536 pixels are changes being applied?
      controlDirection: 0,    // ?? 1=up, -1=down, 0=stopped

      slidingSpeedPower: 0,

      slidingAnimId: null,
      slidingStarted: false
    }
  },

  /**
   *  --== COMPUTED =======================================================================================--
   */
  computed: {

    // INITIAL STATE:
    // (Before any sliding or filters)
    //
    pipelineInit () {

      let pixels, colors

      // 1. Pixels (todo: multiple bitmap filters)
      //
      pixels = this.value.bitmap
        ? Array.prototype.slice.call(this.value.bitmap.pixels)
        : new Array(65536).fill(66)

      // 2. Colors
      colors = this.value.palette.colors


      // pipelineInit => Output
      let out = {
        pixels,
        colors,
        imageData: MoeUtils.imageDataFromPixelsAndColors({pixels, colors})
      }
      console.clear()
      console.log('** COMPUTED pipelineInit()', out)
      return out

    },


    pipelineFiltered() {

      let input = this.pipelineInit
      let tmpPixels = [].concat(input.pixels)
      let inputPixels = input.pixels
      let inputColors = input.colors
      
      this.value.filters.forEach((filter, i) => {

        // F1) Compute SLIDER FILTER
        if (filter.type === 'slider') {
          tmpPixels = crunch.add(tmpPixels, filter.delta)
          filter.pixelsOut = [].concat(tmpPixels)
          filter.imageData = MoeUtils.imageDataFromPixelsAndColors({pixels: tmpPixels, colors: inputColors})
          filter.pixelSummary = MoeUtils.getPixelSummary(filter.pixelsOut)
          console.log('computed filter ', filter)
        }
        // F2) Compute BITMAP FILTER
        else if (filter.type === 'bitmap') {
          // filter.pixelsOut = [].concat(tmpPixels)
          

          // F2.A. Remap pixel colors?
          if ((1==1 || filter.remapToPalette) && filter.bitmap) {
            let bitmapColors = filter.bitmap.palette.colors || ColorUtils.GeneratePaletteColors('raw')
            let bitmapPixels = filter.bitmap.pixels
            // create palette map
            let map = bitmapColors.map(b => {
              let m2 = inputColors.findIndex(p => {return p.id === b.id})
              return m2 > -1 ? m2 : 0
            })
            // apply palette map
            for (let i = 0; i < tmpPixels.length; i++) {
              tmpPixels[i] = map[bitmapPixels[i]]
            }
          }

          filter.pixelsOut = [].concat(tmpPixels)
          filter.imageData = MoeUtils.imageDataFromPixelsAndColors({pixels: tmpPixels, colors: input.colors})
          filter.pixelSummary = MoeUtils.getPixelSummary(filter.pixelsOut)
          console.log('computed filter ', filter)






          // // TODO: 3 & 4 to be moved to individual image filters
          // // 3. Unnamp Color map
          // if (this.value.options.unmapColorMap && this.value.colormap) {
          //   for (let i=0; i < 65536; i++) {
          //     pixels[i] = (pixels[i] + 256 - this.value.colormap.pixels[i]) % 256
          //   }
          // }

          // // 4. Unmap Pixel Map
          // if (this.value.options.unmapPixelMap && this.value.pixelmap) {
          //   let unmappedPixels = new Array(65536)
          //   for (let i = 0; i < 65536; i++) {
          //     unmappedPixels[i] = pixels[this.value.pixelmap[i * 2] + 256 * this.value.pixelmap[i * 2 + 1]];
          //   }
          //   pixels = unmappedPixels
          // }





        }

      })

      // pipelineFiltered => Output
      let out = {
        pixels: tmpPixels,
        colors: input.colors
      }
      console.log('** COMPUTED pipelineFiltered()', out)

      return out

    },


    debug () {
      try {
        let a = ' '
        return this.myValue.bitmap.pixels.slice(-8)
      } catch(e) {
        return 'not defined'
      }

    },
    // https://github.com/SortableJS/Vue.Draggable
    myFilters: {
      get () {
        return this.value.filters
      },
      set() {
        //alert('sorted')
      }
    },
    myOptions: {
      get () {
        return this.options
      }
    },
    myPalette: {
      get () {
        return this.value.palette
      },
      set() {
        // alert('sorted!')
      }
    },
    myColormap: {
      get () {
        return this.value.colormap
      }
    },
    myBitmap: {
      get () {
        return this.value.bitmap
      },
      set() {
        // alert('sorted!')
      }
    },
    myColormap: {
      get () {
        return this.value.colormap
      },
      set() {
        // alert('sorted!')
      }
    },
    myImageData () {
      // NB. Only used for icon & general. preview imageData is handled manually updating ctx for Art because of fast control, don't  want watchers.
      return this.value ? this.value.imageData : null
    },
    myPaletteImageData () {
      return this.value && this.value.palette ? this.value.palette.imageData : null
    },



    myValue() {
      let val = extend({}, {val: this.value}).val
      return val
    }


  },
  watch: {
    // value: {
    //   handler: function (val, oldVal) {
    //     console.log("WATCH ==> artwork.value", val, oldVal)
    //     if (!oldVal || val.id != oldVal.id) {
    //       console.log('Different artwork.value!')
    //       let imgData = new ImageData(256,256)
    //       if (this.myCtx) this.__updatePreview(imgData)
    //     }
    //     this.myValue = extend({}, {val}).val
    //     this.render()
    //   },
    //   immediate: true
    // },
   'value.options': {
      handler: function(val, oldVal) {
        // let art = this.render()
        console.log("WATCH ==> artwork.value.options", val, oldVal)
        let art = {
          id: this.value.id,
          options: val
        }
        this.$store.dispatch('updateFields', {artworks: [art]} )
      },
      deep: true
    },
    paletteDDL(newValue) {
      const colors = ColorUtils.GeneratePaletteColors(newValue)
      // generate imageData
      let imageData =  MoeUtils.imageDataFromColors(colors)
      // return palette
      let pal = {
        id: UID++,
        colors,
        imageData
      }
      let art = {
        id: this.value.id,
        palette: pal
      }
      this.$store.dispatch('updateFields', {artworks: [art]} )
    }
  },
    /**
   *  --== METHODS =================METHODS===================METHODS=======================METHODS============================--
   */
  methods: {
    setActiveFilter(i) {
      this.activeFilter = i

      // Coose preview pixels
      SLIDING_PIXELS =
        i > -1 ? this.value.filters[i].pixelsOut
        : i === -1
          ? this.pipelineInit.pixels
          : this.pipelineFiltered.pixels // -2

      this.__updatePreview({
        pixels: SLIDING_PIXELS,
        colors: this.value.palette.colors
      })

    },

    filterDeltaImageData(i) {
      // Return greyscale imageData representing a filter's delta value
      let out = MoeUtils.imageDataFromPixels(this.value.filters[i].delta)
      return out
    },


    clickPreview(e) {
      let
        x = parseInt(e.offsetX / e.target.offsetWidth * 256),
        y = parseInt(e.offsetY / e.target.offsetHeight * 256)

      console.log('Clicky ' + x + ', ' + y)

    },

    changePeriod(amt) {
      let pattern = this.slidingSpeedsPattern.split(',')
      pattern = pattern.reduce(function(result, element, i) {
        if (amt===1) {
          result.push(element)
          result.push(element)
        } else {
          if (i%2==0) {
            result.push(element)
          }
        }
        return result
      }, [])
      this.slidingSpeedsPattern = pattern.join(',')
    },
    changeAmplitude(amt) {
      let pattern = this.slidingSpeedsPattern.split(',')
      pattern = pattern.reduce(function(result, element, i) {
        if (amt===1) {
          result.push(element*2)
        } else {
          if (i%2==0) {
            result.push(parseInt(element/2))
          }
        }
        return result
      }, [])
      this.slidingSpeedsPattern = pattern.join(',')
    },

    onUpdate (e) {
      let tmp = extend({}, {val: this.myValue}).val
      this.$emit('input', tmp)
    },

    __updatePreview({ pixels, colors}) {

      // RENDER PREVIEW
      // & Apply pixelmap, colormap to preview (unmap)

      let theColor, mappedIndex, mappedColorIndex

      for (var i=0; i<65536; i++ ) {

        // Apply pixelmap
        if (this.value.options.mapPixelMap && this.value.pixelmap) {
          mappedIndex = (this.value.pixelmap[i*2] + 256 * this.value.pixelmap[i*2+1]) * 4
        } else {
          mappedIndex = i * 4
        }

        // Apply colormap
        if (this.value.options.mapColorMap && this.value.colormap) {
          mappedColorIndex = (pixels[i] + this.value.colormap.pixels[i]) % 256
        } else {
          mappedColorIndex = pixels[i]
        }

        try {
          theColor = colors[mappedColorIndex];
          IMAGEDATA.data[mappedIndex] = theColor.r; //*4 =*4 =*4 =*4 = !! NB!!!
          IMAGEDATA.data[mappedIndex+1] = theColor.g;
          IMAGEDATA.data[mappedIndex+2] = theColor.b;
          IMAGEDATA.data[mappedIndex+3] = 255;
        }
        catch(e) {
          console.log('error', colors, theColor, pixels[i], i)
          console.log(i, pixels[i], pixels.length);
          this.__stopSliding()
          return;
        }
      }
      this.myCtx.putImageData(IMAGEDATA, 0, 0)
    },

    addFilter(type) {
      console.log('addFilter')
      let filter
      if (type==='slider') {
        filter = Factory.createFilter_Slider()
      }
      else if (type==='bitmap') {
        filter = Factory.createFilter_Bitmap()
      }

      let filters = extend({}, {val: this.value.filters}).val
      filters.push(filter)
      let art = {
        id: this.value.id,
        filters: filters
      }
      this.$store.dispatch('updateFields', {artworks: [art]} )
    },

    deleteFilter(i) {
      let filters = extend({}, {val: this.value.filters}).val
      filters.splice(i, 1)
      let art = {
        id: this.value.id,
        filters: filters
      }
      this.$store.dispatch('updateFields', {artworks: [art]} )
    },

    dropBitmapFilter(e, i) {
      // Drop a bitmap on a bitmap filter
      console.log('dropBitmapFilter')
      e.item.remove() // will be added by v-for instead
      let filters = extend({}, {val: this.value.filters}).val
      filters[i].bitmap = e.clone.obj
      let art = {
        id: this.value.id,
        filters: filters
      }
      this.$store.dispatch('updateFields', {artworks: [art]} )
    },
    dropPalette(e) {
      console.log('dropPalette')
      e.item.remove() // will be added by v-for instead
      let art = {
        id: this.value.id,
        palette: e.clone.obj
      }
      this.$store.dispatch('updateFields', {artworks: [art]} )
    },
    dropBitmap(e) {
      console.log('dropBitmap')
      e.item.remove() // will be added by v-for instead
      let art = {
        id: this.value.id,
        bitmap: e.clone.obj
      }
      this.$store.dispatch('updateFields', {artworks: [art]} )
    },
    dropColorMap(e) {
      console.log('dropColormap')
      e.item.remove()
      let art = {
        id: this.value.id,
        colormap: e.clone.obj
      }
      this.$store.dispatch('updateFields', {artworks: [art]} )
    },
    dropPixelMapInput(e) {
      console.log('dropPixelMapInput')
      e.item.remove() // will be added by v-for instead
      this.pixelMapInput = e.clone.obj
      let pixelsIn = this.pixelMapInput.pixels
      let mapOut = []
      for (let i = 0; i< 256; i++) {
        for (let y = 0; y < 256; y++) {
          for (let x = 0; x < 256; x++) {
            let offset = x + y * 256
            if (pixelsIn[offset] === i) {
              mapOut.push(x)
              mapOut.push(y)
            }
          }
        }
      }
    },
    //
    __init() {
      this.slidingLower = new Array(65536).fill(0)
      //this.slidingCurrent = new Array(65536).fill(0)
      this.slidingUpper = new Array(65536).fill(255)
      this.slidingSpeeds = new Array(65536).fill(0)
      this.slidingImageData = new ImageData(256, 256)
    },

    __populateSlidingSpeeds() {

      let speeds = this.slidingSpeedsPattern.split(',')
      this.slidingSpeedsLength = speeds.length
      this.slidingSpeedsGradations = parseInt(65536 / this.slidingSpeedsLength)
      for (let i=0; i<65536; i++) {
        this.slidingSpeeds[i] =  parseInt(speeds[i%speeds.length]);
      }

      // pixelmap => Sliding speeds
      if (this.value.options.mapPixelMapSpeeds) {
        let tmp = []
        for (let i=0; i < 65536; i++) {
          tmp.push (this.slidingSpeeds[i*2] + 256 * [i*2+1])
        }
        this.slidingSpeeds = tmp
      }

    },




    __startSliding() {

      // If activeFilter, pick up the pixels from that filter's output otherwise use what's there.
      let i = this.activeFilter

      SLIDING_PIXELS = i > -1 ? this.value.filters[i].pixelsOut.slice() : SLIDING_PIXELS
      // Hacvk for first time
      if (!SLIDING_PIXELS) {
        SLIDING_PIXELS = new Array(65536).fill(87)
      }

      SLIDING_COLORS = this.value.palette.colors

      this.__populateSlidingSpeeds()

      // LAST_TIME = Date.now()
      this.controlPower = 0
      this.controlTargetPower = 0
      this.controlActualPower = 0

      this.slidingStarted = true
      this.slidingAnimId = requestAnimationFrame(this.__animateSliding)

    },

    __stopSliding() {
      if (!this.slidingStarted) return
      console.log('__stopSliding')

      // If activeFilter, pick up the pixels from that filter's output otherwise use the final filter pipeline output.
      let i = this.activeFilter
      if (i > -1) {

        let lower = i > 0 ? this.value.filters[i-1].pixelsOut : this.pipelineInit.pixels
        let filters = extend({}, {val: this.value.filters}).val

        filters[i].delta = crunch.sub(SLIDING_PIXELS, lower)

        let art = {
          rem: 'Stop Sliding',
          id: this.value.id,
          filters: filters
        }
        this.$store.dispatch('updateFields', {artworks: [art]} )

      }

      this.slidingStarted = false
      cancelAnimationFrame(this.slidingAnimId)

    },

    // __dragLever() {
    //   this.__computeSlidingSpeed(this.controlTargetPower);
    // },

    __animateSliding(TIME) {

      // ELAPSED_TIME = TIME - LAST_TIME
      // LAST_TIME = TIME

      // smoothy
      this.controlActualPower += (this.controlTargetPower - this.controlActualPower) * .1 //* ELAPSED_TIME/1000
      // this.controlActualPower = this.controlTargetPower

      // console.log(ELAPSED_TIME, this.controlActualPower, this.controlTargetPower)
      this.__computeSlidingSpeed(this.controlActualPower)

      SLIDING_PIXELS = (this.controlDirection > 0)
        ? crunch.add(SLIDING_PIXELS, this.slidingSpeed)
        : crunch.sub(SLIDING_PIXELS, this.slidingSpeed)

      // recCounter++;
      if (SLIDING_PIXELS.length > 65536) {

        SLIDING_PIXELS.shift(1);

        console.log('too high beep!')
        //oRangeDisplay.val(oRangeDisplay.val() + " \n " + " Stopping @ " + (controlDirection > 0 ? "UPPER":"LOWER") );
        // this.__stopSliding();

      }


      // this.slidingImageData = tmp
      // update Preview
      this.__updatePreview({pixels: SLIDING_PIXELS, colors: SLIDING_COLORS})

      // DEBUG
      //
      // var position = "";
      // for (var p=0;p<256;p+=32) {
      //   position+=(slidingCurrent[p*256+p]+"-");
      // }
      // oRangeDisplay.val(position + "\n Power: " + controlPower + "\nRate: " + slidingSpeedPower); 	// readout

      // 2. Continue @ANIM
      //
      this.slidingAnimId = requestAnimationFrame(this.__animateSliding);
    },

    __computeSlidingSpeed(pow) {

	    // val should be (currently) from -10,000 to +10,000

      // 1. Calculate speed
      //
      this.controlDirection = (pow > 0) ? 1 : -1;
      this.controlPower = Math.abs(pow);


      if (!this.value.options.slidingLocked) {
        this.slidingSpeedPower = parseInt( ((65536 )*this.controlPower/10000) ) ;
      } else {
        this.slidingSpeedPower = parseInt(this.controlPower/10000 * this.slidingSpeedsGradations) * this.slidingSpeedsLength;

      }

      // record
      //
      // if (slidingSpeedPower!=recLevel) {
      //   recHistory.push([recLevel, recCounter]);
      //   recLevel = slidingSpeedPower;
      //   recCounter=0;
      // }

	    this.slidingSpeed = this.slidingSpeeds.slice(0, this.slidingSpeedPower); // GOOD METHOD (but Remember the better one you thought of!!!)

      // Visualisation
      let tmp = new ImageData(256,256)
      let inset = (65536 * 4) - this.slidingSpeedPower * 4
      for (let i = 0 ; i < this.slidingSpeedPower; i++ ) {
        tmp.data[inset++] = this.slidingSpeed[i]
        tmp.data[inset++] = this.slidingSpeed[i]
        tmp.data[inset++] = this.slidingSpeed[i]
        tmp.data[inset++] = 255
      }
      this.slidingSpeedsImageData = tmp
    }

  },
  mounted () {
    this.myCtx = this.$refs.preview.getContext('2d')

  },
  created () {
    this.__init()
  },
  beforeDestroy () {
  }
}
</script>
<style lang="stylus">


  pre
    margin 0 2px
    font-size 12px
  .q-card.active
    background #555 !important

  .dark-example
    background #333

// html
//   background-image linear-gradient(#eee, #aaa)
//   height 100%



  // *****  FRAME CLASSIC  https //codepen.io/chris22smith/pen/PbBwjp
  .picture-frame-classic
    background-color #ddc
    border solid 5vmin #eee
    border-bottom-color #fff
    border-left-color #eee
    border-radius 2px
    border-right-color #eee
    border-top-color #ddd
    box-shadow 0 0 5px 0 rgba(0,0,0,.25) inset, 0 5px 10px 5px rgba(0,0,0,.25)
    box-sizing border-box
    display inline-block
    width  100%
    padding 5vmin
    position relative
    text-align center
    & before
      border-radius 2px
      bottom -2vmin
      box-shadow 0 2px 5px 0 rgba(0,0,0,.25) inset
      content ""
      left -2vmin
      position absolute
      right -2vmin
      top -2vmin

    & after
      border-radius 2px
      bottom -2.5vmin
      box-shadow  0 2px 5px 0 rgba(0,0,0,.25)
      content ""
      left -2.5vmin
      position absolute
      right -2.5vmin
      top -2.5vmin

  .picture-frame-classic > picture-mat
    border solid 2px
    border-bottom-color #ffe
    border-left-color #eed
    border-right-color #eed
    border-top-color #ccb
    max-height 100%
    max-width 100%
  .picture-frame-classic > picture-mat > picture-art
    width 100%
    height 100%






  // *****  FRAME MODERN   https //thinkux.ca/blog/Creating-Framed-Matted-Pictures-Using-CSS/
.picture-frame-modern {
  position: relative;
  width: 100%;
  padding-bottom: 82.5%;
  background: black;
  box-shadow: 0 10px 7px -5px rgba(0, 0, 0, 0.3);
}

.picture-frame-modern .picture-mat {
  position: absolute;
  background: white;
  top: 3.0303%; bottom: 3.0303%; left: 2.5%; right: 2.5%;
  box-shadow: 0px 0px 20px 0px rgba(0,0,0,0.5) inset;
}

.picture-frame-modern .picture-art {
  position: absolute;
  top: 16.129%; bottom: 16.129%; left: 13.158%; right: 13.158%;
}

.picture-frame-modern canvas {
  width: 100%;
}

.picture-frame-modern .picture-art:after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0px 0px 20px 0px rgba(0,0,0,0.5) inset;
}



  // *****  FRAME MINIMAL   https //thinkux.ca/blog/Creating-Framed-Matted-Pictures-Using-CSS/
.picture-frame-minimal {
  position: relative;
  width: 100%;
  padding-bottom: 82.5%;
  background: black;
  box-shadow: 0 10px 7px -5px rgba(0, 0, 0, 0.3);
}

.picture-frame-minimal .picture-mat {
  position: absolute;
  background: white;
  top: 3.0303%; bottom: 3.0303%; left: 2.5%; right: 2.5%;
  box-shadow: 0px 0px 20px 0px rgba(0,0,0,0.5) inset;
}

.picture-frame-minimal .picture-art {
  position: absolute;
  top: 16.129%; bottom: 16.129%; left: 13.158%; right: 13.158%;
}

.picture-frame-minimal canvas {
  width: 100%;
}

.picture-frame-minimal .picture-art:after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0px 0px 20px 0px rgba(0,0,0,0.5) inset;
}




  // *****  FRAME MINIMAL   https //thinkux.ca/blog/Creating-Framed-Matted-Pictures-Using-CSS/
.picture-frame-none mat {
  width:100%;
  height:100%;
}


</style>



//- https://jsfiddle.net/Herteby/rwfam6p1/

//- <div id="vue">
//-   <input v-model="input">
//-   <select v-model="selected">
//-     <option v-for="fn, name in filters" :value="name">{{name}}</option>
//-   </select>
//-   <button @click="filterChain.push(selected)">Add to chain</button>
//-   <h3>Filter chain:</h3>
//-   <span v-for="filter, i in filterChain" @click="filterChain.splice(i, 1)">
//-     {{filter}} >
//-   </span>
//-   <h3>Result:</h3>
//-   {{output}}
//- </div>

//- // new Vue({
//- //   el:'#vue',
//- //   data(){
//- //   	return {
//- //     	input:'Hello, world!',
//- //       selected:'reverse',
//- //       filters:{
//- //       	reverse: val => val.split('').reverse().join(''),
//- //         space: val => val.split('').join(' '),
//- //         upperCase: val => val.toUpperCase(),
//- //         lowerCase: val => val.toLowerCase()
//- //       },
//- //       filterChain:[]
//- //     }
//- //   },
//- //   computed:{
//- //   	output(){
//- //     	let thing = this.input
//- //       this.filterChain.forEach(filterName => {
//- //         thing = this.filters[filterName](thing)
//- //       })
//- //     	return thing
//- //     }
//- //   }
//- // })
                   //- j-canvas(:value='paletteFilterOutput', style='width:60px;height:60px;')
                      //- j-canvas(:value='paletteFilterOutput', style='width:60px;height:60px;')





        //- div.row

        //-   div.col

        //-     // BITMAP
        //-     q-card(color='dark')
        //-         q-card-main
        //-           div.row

        //-           div.row

        //-           div.row
        //-             j-drop-target(:value='pixelMapInput', @add='dropPixelMapInput($event)', style='width:80px;height:80px;')

        //-               div.row.no-wrap
        //-                 // Art Palette




        //-                 j-canvas(:value='pipelineInit.imageData', style='width:80px;height:80px;')
        //-             //- div.col
        //-               //- |BITMAP
        //-               //- div.row.no-wrap
        //-               //-   // Bitmap
        //-               //-   j-drop-target(:value='myBitmap', @add='dropBitmap($event)', style='width:80px;height:80px;')
        //-               //-   //- j-canvas(:value='bitmapFilterOutput.colors', style='width:80px;height:80px;')


        //-           div.row.gutter-xs
        //-             div.col-6
        //-               q-toggle(v-model="myValue.options.useNewPalette", label='Active')
        //-               q-toggle(v-model="myValue.options.remapBitmapToPalette", label='Remap Bitmap')
        //-             div.col-6
        //-               q-select(dark, v-model='myValue.options.aspect', :options='aspectOptions')
        //-           div.row
        //-             div.col

                    //-     //- j-drop-target(:value='goboFrame', @add='dropGoboFrame($event)', style='width:80px;height:80px;')
                    //-     //- j-canvas(:value='bitmapFilterOutput.colors', style='width:80px;height:80px;')
                    //-   div.col-3
                    //-     q-toggle(v-model="myValue.options.unmapPixelMap", label='Unmap')
                    //-     q-toggle(v-model="myValue.options.mapPixelMap", label='Map')
                    //-   div.col-3
                    //-     q-toggle(v-model="myValue.options.unmapPixelMapSpeed", label='Unmap Speed')
                    //-     q-toggle(v-model="myValue.options.mapPixelMapSpeed", label='Map Speed')
                    //- |COLORMAP
                    //- div.row.no-wrap
                    //-   div.col-3
                    //-     // colorMapInput
                    //-     j-drop-target(:value='myColormap', @add='dropColorMap($event)', style='width:80px;height:80px;')
                    //-   div.col-3
                    //-     q-toggle(v-model="myValue.options.unmapColorMap", label='Unmap')
                    //-     q-toggle(v-model="myValue.options.mapColorMap", label='Map')



            //- // GOBO
            //- q-card(color='dark')
            //-     q-card-main
            //-       div.row
            //-         div.col
            //-           |GOBO
            //-           div.row.no-wrap
            //-             // Bitmap
            //-             //- j-drop-target(:value='gobo', @add='dropGobo($event)', style='width:80px;height:80px;')
            //-             //- j-drop-target(:value='goboFrame', @add='dropGoboFrame($event)', style='width:80px;height:80px;')
            //-             //- j-canvas(:value='bitmapFilterOutput.colors', style='width:80px;height:80px;')
