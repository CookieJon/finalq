<template>

  <!-- J-PANEL -->
  <div
    ref='container'
    class='j-panel non-selectable xshadow-transition hoverable-5'
    :class='class_Panel'
    :style='style_Panel'
  >
  <!--  "quasar-framework": "git+https://git@github.com/quasarframework/quasar-edge.git", -->


    <!-- > J-PANEL-HEADER -->
    <div
      class='j-panel-header'
      @xdblclick='toggle_ExpandCollapse()'
      ref="header"
    >
      <!-- > HEADER > j-PANEL-TITLEBAR -->
      <div class='j-panel-tools j-panel-titlebar'>

        <!--  J-PANEL-TOOL: Panel icon -->
<!--
  or if you prefer the non self-closing tag version
  which allows to add a QPopover or QTooltip:
-->
<q-icon :name="icon">
  <q-tooltip>Some tooltip</q-tooltip>
</q-icon>

        <!--  J-PANEL-TOOL: Panel title -->
        <span class="title">{{ title }}</span>

        <!--  J-PANEL-TOOL: Toggle Expand Panel -->
        <q-btn :icon="class_PanelExpandArrow" ref="target1" flat round small />


        <!--  J-PANEL-TOOL: Action Menu -->
        <q-btn ref="target2" class="primary" flat small>
          <q-icon name="menu" />
          <q-menu ref="menu" anchor-ref="target2"
            :anchor-origin="{vertical: 'bottom', horizontal: 'right'}"
            :target-origin="{vertical: 'top', horizontal: 'right'}" >
            <div class="list item-delimiter" >
              <label class="item item-link">
                <div class="item-primary"><q-icon name="select_all"></q-icon></div>
                <div class="item-content">Select All Items</div>
              </label>
              <label class="item item-link" >
                <div class="item-primary"><q-icon name="clear"></q-icon></div>
                <div class="item-content">Clear Item Selection</div>
              </label>
            </div>
          </q-menu>
        </q-btn>

      </div>

      <!-- >> USER TOOLBAR(s) -->

      <div class='j-panel-tools j-panel-toolbar text-primary'>
        <slot name="toolbar">
        </slot>
      </div>

    </div>
  <!-- <q-scroll-area
          :thumb-style="{
            right: '4px',
            borderRadius: '2px',
            background: 'black',
            width: '5px',
            opacity: 1
          }"
          :delay="1500"
        > -->
    <!-- > J-PANEL-CONTENT -->
    <div
      class='j-panel-content'
      ref="content"
    >
      <!-- <div
        class='j-panel-content-inner scroll'
        ref="content-inner"
      > -->

   <!--    <pre>{{ state }}</pre> -->


        <!-- user content -->
      
          <slot name="content"></slot>
      
       <!-- </div> -->
    </div>
  <!-- </q-scroll-area> -->
    <!-- j-panel-footer -->
    <div class='j-panel-footer hidden' ref="footer">

      <!-- user toolbars -->
      <slot name="footer"></slot>

    </div>

  </div>

</template>


<script>
  /* eslint-disable */
  // import { Utils } from 'quasar'
import { extend, QBtn, QIcon, QScrollArea, QTooltip, QMenu } from 'quasar'

 var _static = require('./j-panel-static.js')
  // import '../../store/actions'

  var $ = require('jquery')
  require('jquery-ui/ui/widgets/draggable')
  require('jquery-ui/ui/widgets/resizable')
  require('jquery-ui/themes/base/core.css')
  require('jquery-ui/themes/base/theme.css')
  require('jquery-ui/themes/base/draggable.css')
  require('jquery-ui/themes/base/resizable.css')

  var s // shortcut for 'this.state'

  // require('jquery-ui-touch-punch')
  export default {
    name: 'j-panel',
    components: {QBtn, QIcon, QTooltip, QScrollArea, QMenu},
    props: {
      value: { default () { return {prop1: 'one', prop2: 'two'} } },
      title: { type: String },
      width: { type: Number, default: 240 },
      height: { type: Number, default: 460 },
      x: { type: Number, default: 10 },
      y: { type: Number, default: 10 },
      expanded: {
        type: Boolean,
        default: true,
        twoWay: true,
        coerce: Boolean
      },
      icon: String,
      img: String,
      avatar: String,
      label: String
    },
    data () {
      return {
        state: {
          x: 10,
          y: 10,
          width: 300,
          height: 400,
          header_height: 40,
          zIndex: 10,
          expanded: true
        },
        test: null,
        id: null,
        order: 0,
        _static: null
      }
    },
    computed: {
      __value () {
        // clone prop
        return  Utils.extend({}, this.value)
      },
      // View Rules
      style_Panel () {
        var s = this.state
        return {
          left: s.x + 'px',
          top: s.y + 'px',
          width: s.width + 'px',
          height: s.expanded ? s.height + 'px' : '45px',
          'z-index': this.order
        }
      },
      class_PanelExpandArrow () {
        var s = this.state
        return s.expanded?'arrow_drop_down':'arrow_drop_up'
      },
      class_Panel () {
        var s = this.state
        return (this.state.expanded === true) ? 'is-expanded' : 'is-collapsed'
      },
      __properties () {
        // [{}]

        // return this.__value.getOwnPropertyDescriptors(obj)
        let out = {}
        for (var property in this.__value) {
          if (this.__value.hasOwnProperty(property)) {
            let type = typeof property === "object" ? (Array.isArray(property) ? "array" : "object") : typeof property
            out[property] = {
              type: type
            }
          }
        }
        // console.log('___properties ', out)
        return out
      }
    },
    //
    // HOOKS
    //
    created () {
      s = this.state
      _static._panels.push(this)
      _static._panelCount++
      _static._currentPanel = this
      this.state.x = this.x
      this.state.y = this.y
      this.state.width = this.width
      this.state.height = this.height
      this._static = _static
      this.order = _static._panels.length - 1
      this.id = 'Panel-00' + _static._panelCount
      // console.log('CREATED j-PANEL:', this.order, this)
      // console.log("State = ", s)
    },
    mounted () {
      var vm = this
      var $el = $(vm.$el)
      // var $content = $(vm.$refs.content)
      this.header_height = $(vm.$refs.header).outerHeight()


      // Resizable
      //
      $el
        .resizable({
          stop (event, ui) {
            vm.state.width = ui.size.width
            vm.state.height = ui.size.height
            console.log(ui.size)
          },
          handles: 'all'
          // helper: '.resizable-helper'
        })
        .on('mousedown', function () {
          vm.moveToFront()
        })
        .draggable({
          handle: '.j-panel-header',
          start: function (event, ui) {
            $el.removeClass('shadow-4')
            $el.addClass('shadow-2')
          },
          stop: function (event, ui) {
            $el.removeClass('shadow-4')
            $el.addClass('shadow-2')
            vm.state.x = ui.position.left
            vm.state.y = ui.position.top
          }
        })
    },
    methods: {
      toggle_ExpandCollapse () {
        this.state.expanded = !this.state.expanded
        console.log(this.state.expanded)
      },
      debugState () {
        return this.___properties
      },
      onClick (e) {
        this.$store.dispatch('addBitmap')
        console.log('panel toolbar click', e)
      },
      toggle () {
        this.expanded = !this.expanded
        console.log(this.computedStyle)
      },
      moveToFront () {
        var _panels = this._static._panels
        _panels.push(_panels.splice(this.order, 1)[0])
        //  array.push(array.splice(array.indexOf(element), 1)[0]);

        _panels.forEach(function (value, index) {
          value.order = index
          // console.log(index, value.title, 'order=', value.order)
        })
      },
      fetchPic () {
        this.$http.get('/path/to/api').then(function (response) {
          this.pic_url = response
        }.bind(this))
      }
    }
  }
</script>



<style lang='styl'>

  // @import '../../themes/app.variables.styl'



  input, h1, h2, h3, h4, h5, h6
    color white

  .ui-draggable-handle
    cursor grab

  .ui-draggable-handle:active
    cursor grabbing


  .j-panel
    transition box-shadow .2s ease-in-out 0s
    position absolute
    overflow hidden
    display flex
    flex-wrap nowrap
    flex-direction column
    justify-content flex-start
    align-items stretch
    align-content flex-start
    zbackground-clip border-box
    min-width 50px
    border-top-left-radius 2px
    border-top-right-radius 2px
    box-shadow 0 3px 6px 3px rgba(1,1,1,0.4)
    z-index 5
    width 100%
    background-color rgba(255, 255, 255, 0.1)
    background-color rgba(0, 0, 0, 0.1)
    xbackground-color $light
    pointer-events none
    & > div
      pointer-events auto
    &:hover
      & .j-panel-content
        box-shadow 0px 0px 7px #fff
      & .j-panel-header
        & i
        & span.title
          background $fff
    &.is-collapsed
      transition height .4s ease-in-out 0s
      & > .j-panel-toolbar
        height 0px !important
        position relative
        transform translateY(-100%)
      & > .j-panel-content
        opacity 0
      & > .j-panel-footer
        opacity 0


  .j-panel-header
    cursor pointer
    z-index 10
    xflex-shrink 0
    transition all 0.2s
    xbackground $primary



  & .j-panel-titlebar
    background $primary
    // background $toolbar-background
    z-index 10
    color white
    padding 4px 8px
    display flex
    flex-wrap nowrap
    flex-direction row
    justify-content space-between
    // align-content center
    align-items center
    box-shadow 0 1px 3px 2px rgba(1,1,1,0.4)
    & span.title
      flex-grow 1
      margin-left 8px
      font-size 1.1rem
    & i.panelExpandArrow
      transition transform 0.2s

  .j-panel-toolbar
    color $primary-light
    background #B0BEC5
    font-size 1rem
    padding 4px
    display flex
    flex-wrap nowrap
    flex-direction row
    justify-content space-between
    // align-content center
    align-items center
    transition transform 0.2s
    transform translateY(0%)
    z-index 9
  & > i
    font-size 24px
    /* Support for Safari and Chrome. */
    text-rendering: optimizeLegibility;
    /* Support for Firefox. */
    -moz-osx-font-smoothing: grayscale;
    /* Support for IE. */
    font-feature-settings: 'liga';
/*  & > button ~ button
    margin-left 8px*/

  & .btn.circular.small
    height 33px
    width 32px
    margin-right: 4px




  .j-panel-content
    xborder 2px dotted yellow
    overflow hidden
    padding 2px
    transition all 0.2s
    color $light
    flex-grow 1
    display flex
    flex-wrap nowrap
    flex-direction column
    background-color rgba(255, 255, 255, 0.35)
    z-index 0
    padding-top 0
    xtransform translateX( -100px )
    z-index 9
    background-color rgba(255, 255, 255, 0.1)
    xbackground-color rgba(0, 0, 0, 0.2)
    xbackground-color rgba(85, 85, 85, .6)
    

  .j-panel-content-inner
    xborder 2px dotted yellow
    overflow hidden
    padding 2px
    flex-grow 1
    display flex
    flex-wrap nowrap
    flex-direction column
    xbackground white

  .content-item
    border 1px solid red

  .panel-item-grow
    xborder 4px dotted red
    overflow hidden
    flex-grow 1
    display flex
    flex-wrap nowrap
    flex-direction column
    z-index 0
    padding-top 0
    xperspective 100px
    xtransform translateX( -100px )

  .j-panel-footer
    xborder 4px dotted pink
    height 36px
    flex-shrink 0
    xbackground $primary
    color white

  .j-panel-area
    border 2px dotted orange
    border-left 4px solid orange

  .flex-grow
    flex-grow 1

  .flex-shrink
    flex-shrink 1

  // .area-resizable

/*
    & > button.circular.small
      width 20px
      height 20px
*/



</style>
