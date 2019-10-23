
<template>
  <div class='frame' @click="$emit('click')">
    <div class='item-label'>{{value.id}} {{value.name}}</div>
    <img :src='src' width="100" height="100" />
  </div>
</template>

<script>
  /* eslint-disable */

  export default {
    name: 'j-item',
    props: {
      value: {
        type: Object
      }
    },
    data () {
      return {
      }
    },
    computed: {
      src() {
        let a = this.value
        if (a.type === 'image') {
          return a.src
        } else if (a.imageData) {
          let canvas = document.createElement("canvas")
          canvas.width = a.imageData.width
          canvas.height = a.imageData.height
          canvas.getContext('2d').putImageData(a.imageData, 0, 0)
          let s = canvas.toDataURL("image/png");
          return s
        }
      }
    },
    methods: {
      onClick (e) {
        
      }
    }
  }
</script>

<style lang="stylus">
  img 
    width 100% !important
    height 100% !important
</style>
