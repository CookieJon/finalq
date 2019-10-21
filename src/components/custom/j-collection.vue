<template>
    <q-scroll-area
      style="height: 200px"
      :thumb-style="{
        right: '4px',
        borderRadius: '2px',
        background: 'black',
        width: '5px',
        opacity: 1
      }"
      :delay="1500"
    >
      <div
        ref="container"
        :class='this.myClass'
        class='frame'
      >
        <j-item
          v-for='(item, i) in value'
          :key='item.id'
          :value='value[i]'
          @click='onSelect(i, $event)'
        ></j-item>
      </div>
    </q-scroll-area>
</template>
<script>
/* eslint-disable */
  import { extend, QScrollArea } from 'quasar'
  import Sortable from 'sortablejs'

  export default {
    name: 'j-collection-rubaxax',
    components: { QScrollArea },
    props: {
      value: {
        type: [Array]
      },
      myClass: {
        type: String,
        default: 'frame-type-grid'
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
    data () {
      let self = this // <- the j-collection component
      return {
        options: {
          animation: 150,
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


            // // Manually set new imagedata because that's how it rolls!
            // let fromCanvas = origEl.getElementsByTagName('canvas')[0]
            // let fromCtx = fromCanvas.getContext('2d');
            // let fromImageData = fromCtx.getImageData(0,0,fromCanvas.width, fromCanvas.height)
            // let toCanvas = cloneEl.getElementsByTagName('canvas')[0]
            // let toCtx = toCanvas.getContext('2d');
            // toCtx.putImageData(fromImageData, 0, 0)

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
      onSelect (index, e) {
        this.$emit("select", {index, item: this.value[index]})
      },
      // Called by any change to the list (add / update / remove)
      // onSort: function (/**Event*/e) {
      //   // same properties as onEnd
      //   // console.log('onSort',e)
      // },
      // // sortablejs events..
      // // Element is dropped into the list from another list
      // onAdd: function (/**Event*/e) {
      //   // console.log('onAdd',e)
      //   this.$emit("add", e)
      //   // same properties as onEnd
      // },
      // Changed sorting within list
      // onUpdate: function (/**Event*/e) {
      //   // same properties as onEnd
      //   // this.$emit("add", this.value[index])
      // },

      // Element is removed from the list into another list
      onRemove: function (/**Event*/e) {
        // same properties as onEnd
        // console.log('onRemove',e)
        this.$emit("add", e)
      },
      // Called when creating a clone of element
      // onClone: function (/**Event*/e) {
      //   var origEl = e.item;
      //   var cloneEl = e.clone;
      //   this.$emit("clone", e)
      //   // console.log('onClone',e)
      //   debugger
      // },
    // Element is chosen
      // onChoose: function (/**Event*/e) {
      //   this.$emit("choose", e.oldIndex)// element index within parent
      // }

    }
  }
</script>

<style lang="stylus">

.ui-resizable
  position absolute

/* frame-type-grid */
.frame.frame-type-grid
  padding 5px
  background-color rgba(0, 0, 0, 0.3)
  width 100%
  overflow hidden

.frame.frame-type-grid > .frame
  width calc(15% - 6px)
  width 64px
  xmax-width 240px
  margin 3px
  xheight 50%
  position relative
  float left
  xmin-height 48px
  border 2px solid #333
  //border-left 4px solid #2196F3
  box-shadow 0 3px 6px 3px rgba(1,1,1,0.4)
  background-color rgba(0, 0, 0, 0.3)
  box-shadow 4px 4px 2px rgba(0, 0, 0, 0.3)
  z-index 10
  padding 0px

.frame.frame-type-grid > .frame > img
  // display none
  width 111px
  height 111px

.frame.frame-type-grid > .frame > canvas
  display inline-block
  margin 0
  padding 0
  width 111px
  height 111px

.frame.frame-type-grid > .frame > canvas.image
  width 111px
  height 111px

.frame.frame-type-grid > .frame > canvas.palette
  position absolute
  width 14%
  right 6px
  margin-top -30%
  background white



.frame.frame-type-list > .frame
  width 100%
  height 180px
  margin 6px
  position relative
  border-left 4px solid #2196F3
  box-shadow 0 3px 6px 3px rgba(1,1,1,0.4)
  background-color rgba(33, 150, 243, 0)
  background-color white
  box-shadow 4px 4px 2px rgba(0, 0, 0, 0.3)
  z-index 10
  padding 0px

.frame.frame-type-list > .frame > img
  // display none
  height 11px
.frame.frame-type-list > .frame > canvas
  height 180px
  position relative
  border-left 6px solid #2196F3
  background-color white
  z-index 10
  padding 0px
.frame.frame-type-list > .frame > canvas.palette
  display none

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

.frame.frame-type-list > .frame > .item-label
  height 80px
  width 180px
  padding 2px
  margin-left 6px
  margin-top -80px

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
