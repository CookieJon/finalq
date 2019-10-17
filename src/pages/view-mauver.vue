<template lang="pug">
<!-- root node required -->
div
  |test

  //- selectedArtwork SLIDER
  div(v-if='selectedArtwork != null')
    j-artwork(v-model='selectedArtwork')
  j-upload-zone(ref='zone',@select='addBitmapsFromFiles') <!-- do not delete! -->
  // COLLECTION
  j-panel(icon='business', title='O', :width='185', :height='850', :x='5', :y='5')
    |test
    div.j-panel-toolbar.text-black(slot='toolbar', style='padding:4px;')
      q-btn(small,push,icon='art track', @click='addArtwork')
      q-btn(small,push,icon='satellite', @click='openFileInput')
      //- q-btn(small,push,icon='color lens', @click='addPalette')
    // artworks
    div.j-tray.area.panel-item-grow(slot='content')
      j-collection.frame-type-grid(v-model='artworks', @select='selectArtwork')
    // bitmaps
    div.j-tray.area.panel-item-grow(slot='content')
      j-collection.frame-type-grid(v-model='bitmaps', @select='selectBitmap')
    //- palettes
    //- div.j-tray.area.panel-item-grow(slot='content')
    //-   j-collection.frame-type-grid(v-model='palettes', @select='selectPalette')


  //- selectedBitmapImageData
  j-panel(v-if='selectedBitmapImageData != null', icon='business', title='Selected Bitmap', :width='200', :height='300', :x='110', :y='400')
    div.j-tray.area.panel-item-grow(slot='content')
      j-canvas.frame-type-grid(:image-data='selectedBitmapImageData')

  //- selectedPaletteImageData
  j-panel(v-if='selectedPaletteImageData != null', icon='business', title='Selected Palette', :width='200', :height='300', :x='10', :y='400')
    div.j-tray.area.panel-item-grow(slot='content')    
      j-canvas.frame-type-grid(:image-data='selectedPaletteImageData')

</template>

<script>
/* eslint-disable */
import { dom, event, openURL, QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QList, QItemLabel, QItem, QSlider} from 'quasar'


import MoeObjects from 'src/moe/objects'
//alert("MO" + MoeObjects)
//// import MoeObjects from './moe/objects'

import Factory from 'src/moe/objects/moe.factory.js'


// import dataColors from '../../data'
import iq from 'image-q'

// CREATE INITIAL DATA
import ColorUtils from 'src/moe/utils/moe.utils.color.js'


// let pal = colorUtils.getMaterialColors(0,256)
// let palObj = {}
// pal.forEach(v => palObj[v.id] = v)
// console.log('PALETTE', JSON.stringify(pal))

export default {
  name: 'view-mauver',
  components: { QBtn},
  created () {
    // Create Default Palette & Bitmnap
    //
    var defaultPalette = Factory.createPalette('raw') 
    var defaultBitmap = Factory.createBitmap('raw', defaultPalette)

    this.$store.dispatch('updateEntities', { palettes: defaultPalette, bitmaps: defaultBitmap })

    console.log("BIUTMAP", defaultBitmap);


    // Here we are stubbing the initial data. In the real world, this
    // should be the response from the API Backend.
    // const initialData = dataColors
    // console.log('data', dataColors)
    // this.$store.dispatch('addColors', { data: initialData })
    //this.$store.dispatch('updateEntities', { colors: initialData })
  },
  data () {
    return {
      selectedPaletteId: null,
      selectedBitmapId: null,
      selectedArtworkId: null,
      uid: 0,
      artId: 0,
      palId: 10,
      bmpId: 0,
      colId: 0,
      leverTest: 0,

      bitmaps: []

    }
  },
  computed: {
    selectedArtwork: {
      get () {
        return this.$store.getters.getEntityById('artworks', this.selectedArtworkId)
      },
      set (value) {
        this.$store.dispatch('updateEntities', {artworks: [value]})
      }
    },
    selectedBitmap: {
      get () {
        return this.$store.getters.getEntityById('artworks', this.selectedBitmapId)
      },
      set (value) {
        this.selectedBitmapId = value.id
      }
    },
    selectedPaletteImageData () {
    //  let selectedPalette = this.$store.getters['entities/palettes/find'](this.selectedPaletteId)
    //  return selectedPalette != null ? selectedPalette.imageData : null
    return null
    },
    selectedBitmapImageData () {
      let selectedBitmap = this.$store.getters.getEntityById('bitmaps', this.selectedBitmapId)
      return selectedBitmap ? selectedBitmap.imageData : null
    },
    selectedBitmapPaletteImageData () {
   //   let selectedBitmap = this.$store.getters['entities/bitmaps/find'](this.selectedBitmapId)
    //  return selectedBitmap && selectedBitmap.palette ? selectedBitmap.palette.imageData : null
    return null
    },
    palettes: {
      get () {
        // return this.$store.getters['entities/palettes/query']().orderBy('id', 'desc').get()
        return this.$store.getters.getEntities('palettes')
      },
      set() {
        // alert('sorted')
      }
    },
    bitmaps: {
      get () {
         return this.$store.getters.getEntities('bitmaps')
      },
      set() {
        // alert('sorted')
      }
    },
    artworks: {
      get () {
        return this.$store.getters.getEntities('artworks')
      },
      set() {
        // alert('sorted')
      }
    }
  },
  methods: {

    selectPalette(e) {
      console.log('selectPalette', e)
      this.selectedPaletteId = e.item.id

      let objId = this.selectedPaletteId
      //let obj = this.$store.getters['entities/palettes/find'](objId).with('colors')
      let obj = null
      console.log('FETCH PALETTE with ID=' + objId)
      console.log("== ", obj)

    },
    selectBitmap(e) {
      console.log('selectBitmap', e)
      this.selectedBitmapId = e.item.id
    },
    selectArtwork(e) {
      console.log('selectArtwork', e)
      this.selectedArtworkId = e.item.id
    },

    openFileInput() {
      this.$refs.zone.openFileInput()
    },

    addBitmapsFromFiles (files) {
      for (let i = 0; i < files.length; i++) {
        let file = files[i]
        Factory.createBitmapFromFile(file).then((bmp) => {
          this.$store.dispatch('updateEntities', {bitmaps: [bmp]} )
        }).catch((err) => {
          console.log("ERROR in 'addBitmapsFromFiles'", err)
        })
      }
    },
    addPalette () {
      let pal = Factory.createPalette('raw')
      this.$store.dispatch('updateEntities', {palettes: [pal]})
    },
    addArtwork () {
      let art = Factory.createArtwork(Factory.createPalette('w_rgby1234_b_lumaUndulating'))
      this.$store.dispatch('updateEntities', {artworks: [art]} )
    },

    debugColors(colors) {
      // Debug color list      console.log('Debug colors', colors.length)      let out = '', styles=[]      for (let i=0; i < colors.length; i++) {out += '%c'+i,styles.push('background-color:'+colors[i].hex+';')};console.log("COLORS:");console.log(out, ...styles)
      console.log('Debug colors', colors.length)
    },

    imageDataFromPixelsAndPalette() {

      return imageData
    },
    imageDataFromColors(colors) {
      // Assumes 256 colors!
      let imageData = new ImageData(256, 256)

      if (!colors.length) return imageData
      let offset = 0
      let colorIndex = 0
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          for (let yy = 0; yy < 16; yy++) {
            for (let xx = 0; xx < 16; xx++) {
              offset = (((x * 16) + xx) * 4) +  (((y * 16) + yy) * 256 * 4)
              imageData.data[offset++] = colors[colorIndex].r
              imageData.data[offset++] = colors[colorIndex].g //colors[i].g
              imageData.data[offset++] = colors[colorIndex].b //colors[i].b
              imageData.data[offset++] = colors[colorIndex].a
            }
          }
          colorIndex++
        }
      }


      return imageData

    }
  }
}
</script>

<style lang="stylus">

</style>

