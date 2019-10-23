<template>
  <div
    ref="container"
    class='frame frame-type-droptarget'
    :class='myClass'
  >
    <j-item
      v-if='value'
      :value='value'
      @click='onSelect'
    ></j-item>
  </div>
</template>
<script>
/* eslint-disable */
  import { extend, QScrollArea } from 'quasar'
  import Sortable from 'sortablejs'

  export default {
    name: 'j-droptarget',
    components: { QScrollArea },
    props: {
      value: {
        type: Object
      },
      myClass: {
        type: String,
        default: 'frame-type-grid'
      },
      selected: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      // value(newValue, oldValue) {
      //   let elm = this.$refs.container
      //   // console.log('jCollection watch', newValue)
      //   while (elm.hasChildNodes()) {
      //     elm.removeChild(elm.lastChild);
      //   }
      // }
    },
    computed: {
      myValue () {
        this.value ? [this.value] : null
      },
      myClassx () {
        return this.selected ? 'selected' : ''
      }
    },
    data () {
      let self = this // <- the j-collection component
      return {
        options: {
          animation: 150,
          sort: false,
          scroll: false,
          ghostClass: 'sortable-ghost',  // Class name for the drop placeholder
          chosenClass: 'sortable-chosen',  // Class name for the chosen item
          dragClass: 'sortable-drag',  // Class name for the dragging item
          group: {
            name: 'general',
            pull: 'clone',
            revertClone: true
          },
          setData: (dataTransfer, element) => {
            // ## na ##
            // element.objs = self.value // Attach 'myObjs' reference to my Object array
            // // console.log('onClone cloneEl.objs', element.objs)
          },
          onClone: (e) => {
            let origEl = e.item;
            let cloneEl = e.clone;

            // Manually set new imagedata because that's how it rolls!
            let fromCanvas = origEl.getElementsByTagName('canvas')[0]
            let fromCtx = fromCanvas.getContext('2d');
            let fromImageData = fromCtx.getImageData(0,0,fromCanvas.width, fromCanvas.height)
            let toCanvas = cloneEl.getElementsByTagName('canvas')[0]
            let toCtx = toCanvas.getContext('2d');
            toCtx.putImageData(fromImageData, 0, 0)

            // ## 1 ##
            cloneEl.objs = self.value
            // console.log('onClone cloneEl.objs', cloneEl.objs)
            this.$emit("clone", e)
          },
          onStart: (e) => {

          },
          onAdd: (e) => {
            // ## 2 ##
            e.clone.obj = e.clone.objs[e.oldIndex]
            e.item.remove()
            // console.log('onAdd e.clone.obj', e.clone.obj)
            this.$emit('add', e)
          },
          onEnd: (e)=> {
            // console.log(">>>>> onEnd ", e,  self.value)
          },
          onUpdate: (e)=> {
            // console.log(">>>>> onUpdate ", e, self.value)

            // ** ASSOCIATE THE MOE OBJECT WITH DRAGGED HTML **
            let itemEl = e.item // dragged HTMLElement
            itemEl.obj = self.value[e.oldIndex]
            // console.log("ENDNEDNDNDND", itemEl.obj)
            // e.to    // target list
            // e.from  // previous list
            // e.oldIndex  // element's old index within old parent
            // e.newIndex  // element's new index within new parent

            // v-model implementation
            let tmp = extend({}, {val: self.value}).val // ^-Magic!!  ///let tmp = extend({}, this.value)
            tmp.splice(e.newIndex, 0, tmp.splice(e.oldIndex, 1)[0])
            this.$emit('input', tmp)
          },
          onSort: (e)=> {
            // console.log(">>>>> onSort ", e, self.value)
            this.$emit('sort', e)
          }
        },
        sortFromIndex: null,
        sortToIndex: null
      }
    },
    mounted () {
      var me = this
        Sortable.create(this.$refs.container, this.options)
      },
    methods: {
      // item clicked
      onSelect (e) {
        console.log("*! Clicked", this.value)
        this.$emit("select", {item: this.value})
      },
      // Element is removed from the list into another list
      onRemove: function (/**Event*/e) {
        // same properties as onEnd
        // console.log('onRemove',e)
        this.$emit("add", e)
      }
    }
  }
</script>

<style lang="stylus">

.ui-resizable
  position absolute

/* frame-type-grid */
.frame.frame-type-droptarget
  padding 5px
  background-color rgba(0, 0, 0, 0.3)
  width 100px
  height 100px

  &.selected
    border 2px solid white !important


.frame.frame-type-droptarget > .frame

  position relative
  xfloat left
  min-height 48px
  border 2px solid #333
  //border-left 4px solid #2196F3
  box-shadow 0 3px 6px 3px rgba(1,1,1,0.4)
  background-color rgba(0, 0, 0, 0.3)
  box-shadow 4px 4px 2px rgba(0, 0, 0, 0.3)
  z-index 10
  padding 0px

.frame > .frame > img
  // display none
  width 111px
  height 111px

.frame > .frame > canvas
  display inline-block
  margin 0
  padding 0
  width 111px
  height 111px

.frame > .frame > canvas.image
  width 111px
  height 111px

.frame > .frame > canvas.palette
  position absolute
  width 14%
  right 6px
  margin-top -30%
  background white



.item-label
  position absolute
  height 16px
  padding 2px
  bottom 0
  width 100%
  color white
  font-size .6rem
  background-color  rgba(0, 0, 0, .47)
  z-index 12


.sortable-ghost
  opacity 0.4
  z-index 0

.sortable-chosen
  box-shadow 10px 10px 25px rgba(0, 0, 0, 1)

.sortable-drag
  opacity 1
  box-shadow 10px 10px 25px rgba(0, 0, 0, 1)


.upload-zone {
  xposition:relative;
  xoverflow:hidden;
  xwidth:100%;
  height:100%;
  xbackground:transparent;
  border:4px dashed #333;
  cursor:pointer;
  /* padding:5px; color:#555; font-family:'Segoe UI'; font-weight:bold; */
}
.upload-zone:hover {
  border-color: green;
}


</style>
