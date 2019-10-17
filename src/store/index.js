/* eslint-disable */

import Vue from 'vue'
import Vuex from 'vuex'

import { extend } from 'quasar'

// import * as actions from './actions'
// import cart from './modules/cart'
// import products from './modules/products'

import { normalize, denormalize, schema } from 'normalizr'

const Color = new schema.Entity('colors', {
  // id: null,
  // name: null,
  // r: null,
  // g: null,
  // b: null,
  // a: null,
  // h: null,
  // v: null,
  // chroma: null,
  // luma: null
})

const Palette = new schema.Entity('palettes', {
  // id: null,
  // name: null,
  // imageData: null,
  colors: [ Color ]
})

const Bitmap = new schema.Entity('bitmaps', {
  // id: null,
  // name: null,
  // imageData: null,
  // pixels: null,
  palette: Palette
})

const Artwork = new schema.Entity('artworks', {
  // id: null,
  // name: null,
  // imageData: null,
  // filters: [ Bitmap ],
  bitmap: Bitmap,
  colormap: Bitmap
})

// MASTER SCHEMA
const Museum = {
  colors: [ Color ],
  palettes: [ Palette ],
  bitmaps: [ Bitmap ],
  artworks: [ Artwork ],
}












console.log('................')



Vue.use(Vuex)

const store = new Vuex.Store({
  // modules: {
  //   cart,
  //   products
  // },
  state: {
    entities: {
      colors: {},
      palettes: {},
      bitmaps: {},
      artworks: {},
    },
    result: {
      location: 'Guggenheim'
    }
  },
  actions: {
    updateEntities({commit, state}, data) {
      // @data: e.g. {'artworks': [obj, obj]}
      console.log('updateEntities', data)
      let n = normalize(data, Museum)
      commit('UPDATE_ENTITIES', n.entities)
    },    
    updateFields({commit, state}, data) {
      console.log('--------------------------------------')
      console.log('--------------------------------------')
      console.log('--------------------------------------')
      console.log('--------------------------------------')
      console.log('updateFields', Object.keys(data))
      let entities = normalize(data, Museum).entities
      commit('UPDATE_FIELDS', {entities, data})
    }
  },
  mutations: {
    UPDATE_ENTITIES: function(state, entities) {
      // @payload = normalized entities: {...}
      console.log('UPDATE_ENTITIES', entities)
      for (let type in entities) {
        for (let entity in entities[type]) {
          const oldObj = state.entities[type][entity] || {}
          const newObj = Object.assign(oldObj, entities[type][entity])
          Vue.set(state.entities[type], entity, newObj)
        }
      }
    },
    UPDATE_FIELDS: function(state, {entities, data}) {
      //console.log('UPDATE_FIELDS', {entities, data})
      for (let type in data) {
        for (let entity in data[type]) { // NB: This is an array (not a keyed obejct)...
          const entityId = data[type][entity].id // ... so find the object manually 
          for (let key in data[type][entity]) {
            console.log("UPDATE_FIELD:", type+'.'+entityId+'.'+key)
            Vue.set (state.entities[type][entityId], key, entities[type][entityId][key])
          }
        }
      }      
    }
  },
  getters: {
    // GENERIC GETTERS
    //
    getEntities: (state) => (type) => {
      console.log("STORE GETTER.getEntities", type)
      let ids = Object.keys(state.entities[type])
      let dn = denormalize({ [type]: ids }, Museum, state.entities)
      return dn[type]
    },    
    getEntityById: (state) => (type, id) => {
      console.log("STORE GETTER.getEntityById", type)
      let dn = denormalize({ [type]: [id] }, Museum,  state.entities)
      return dn[type][0]
    },
    
    // https://github.com/vuejs/vuex/issues/598 - Getters return functions
    getColorById: (state, getters) => (id) => {
      return getters.colors.find(x=> x.id === id)
    },
    getColor: (state, getters) => ({ name, color }) => {
      return getters.find( x=> x.fullName === name && x.color === color )
    },

    colors: (state) => {
      let ids = Object.keys(state.entities.colors)
      let dn = denormalize({ colors: ids }, Museum, state.entities)
      return dn.colors
    },
    palettes: (state) => {
      let ids = Object.keys(state.entities.palettes)
      let dn = denormalize({ palettes: ids }, Museum, state.entities)
      return dn.palettes
    }

  }
})

export default store
