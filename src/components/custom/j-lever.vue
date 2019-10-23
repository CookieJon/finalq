  <template>
  <div
    class="q-slider non-selectable"
    :class="{disabled: disable}"
    @mousedown.prevent="__setActive"
    @touchstart.prevent="__setActive"
    @touchend.prevent="__end"
    @touchmove.prevent="__update"
  >
  <div>
    <div ref="handle" class="q-slider-handle-container">
      <div class="q-slider-track"></div>
      <div
        v-if="markers"
        class="q-slider-mark"
        v-for="(n, i) in myRange"
        :key="i"
        :style="{left: n.percent * 100 + '%'}">
        <!-- <div class="q-slider-value">
          {{ n.value  }}
        </div> -->
      </div>
      <div
        class="q-slider-track active-track"
        :style="style_ActiveTrack"
        :class="{'no-transition': dragging, 'handle-at-minimum': value === min}"
      ></div>
      <!--div
        class="q-slider-track value-track"
        :style="style_ValueTrack"
        :class="{'no-transition': dragging, 'handle-at-minimum': value === min}"
      ></div-->
      <div
        class="q-slider-handle"
        :style="{left: dragPercent * 100 +'%'}"
        :class="{dragging: dragging, 'handle-at-minimum': value === min}"
      >
        <div
          class="q-slider-label"
          :class="{'label-always': labelAlways}"
          v-if="label || labelAlways"
        >{{ dragPercent }}</div>
      </div>
    </div>

  </div>
</div>
</template>



<script>
/* eslint-disable */
// import Utils from '../../utils'
import { event } from 'quasar'
import { Platform } from 'quasar'
////import TWEEN from 'es6-tween'
////const { Tween, Easing, Interpolation, autoPlay }  = require('es6-tween');
////autoPlay(true)
// const { Tween, Easing, Interpolation, autoPlay } = require('es6-tween');
// import { Easing, Interpolation, Tween, autoPlay } from 'es6-tween';

export default {
  props: {
    value: {
      type: Number,
      required: true
    },
    rest: String,
    range: {
      // range of segments
      type: Object
    },
    step: {
      type: Number,
      default: 1
    },
    snap: Boolean,
    markers: Boolean,
    label: Boolean,
    labelAlways: Boolean,
    disable: Boolean
  },
  data () {
    return {
      number: 0,
      animatedNumber: 0,
      dragging: false,
      min: 0,
      max: 10,
      currentSegmentMin: { percent: 1, value: null },
      currentSegmentMax: { percent: 0, value: null },
      myRestPercent: parseInt(this.rest,10)/100,
      dragPercent: 0,
      segmentPercent: 0,
      myValue: null
    }
  },
  computed: {
    style_ActiveTrack () {
      let
        rest = parseInt(this.rest),
        drag = this.dragPercent * 100
      return {
        left: Math.min( rest, drag ) + '%',
        width: Math.abs( rest - drag ) + '%'
      }
    },
    style_ValueTrack () {
      let
        rest = parseInt(this.rest),
        drag = this.valuePercent * 100
      return {
        left: Math.min( rest, drag ) + '%',
        width: Math.abs( rest - drag ) + '%'
      }
    },
    myRange () {
      // Array of range segments: percentages for each value waypoint
      // Prop in: {'min': 0, '20%': 99, 'max': 250}
      // myRange: [{percent: 0, value: 0}, {percent: 0.2, value: 99}, {percent: 1, value: 250}]
      let range = Object.keys(this.range).map(v => {
        if (v === 'min') {
          this.min = this.range[v]
          return { percent: 0, value: this.min }
        }
        else if (v === 'max') {
          this.max = this.range[v]
          return { percent: 1, value: this.max }
        }
        else {
          return { percent: parseInt(v) / 100, value: this.range[v] }
        }
      })
      return range
    }
    // ,
    // currentPercent () {
    //   if (this.snap) {
    //     return (this.value - this.min) / (this.max - this.min) * 100 + '%'
    //   }
    //   return 100 * this.currentPercent + '%'
    // }
  },
  watch: {
    dragPercent () {

    },
    step () {
      this.$nextTick(this.__validateProps)
    }
  },
  methods: {
    // smoothStep(a, b, x)
    // {
    //     if(x < 0)
    //         return 0.0f;
    //     if(x >= b)
    //         return 1.0f;

    //     x = (x - a)/(b - a); //normalizes x
    //     return (x*x * (3 - 2*x));
    // },
    // SmoothMove()
    // {
    //   let startspot, endspot

    //   function Start () {
    //       SmoothMove(startspot.position, endspot.position, 5.0);
    //   }

    //   function SmoothMove (startpos : Vector3, endpos : Vector3, seconds : float) {
    //       var t = 0.0;
    //       while (t <= 1.0) {
    //           t += Time.deltaTime/seconds;
    //           transform.position = Vector3.Lerp(startpos, endpos, this.smoothStep(0.0, 1.0, t));
    //           yield;
    //       }
    //   },
    __setActive (e) {
      if (this.disable) {
        return
      }

      let container = this.$refs.handle

      this.dragging = {
        left: container.getBoundingClientRect().left,
        width: container.offsetWidth
      }
      this.$emit('start')
      this.__update(e)
    },
    between (v, min, max) {
      return Math.min(Math.max(v, min), max)
    },
    __updateUsingDragPercent ( dragPercent ) {
      // dragPercent: 0...1
      // If dragPercent out of segment's percent range, set new segment & ranges
      if (!this.currentSegmentMin) {
        console.warn('J-LEVER NO SEGMENT ERROR')
        //alert('no seg')
        return
      }

      if (dragPercent < this.currentSegmentMin.percent || dragPercent > this.currentSegmentMax.percent) {

        let i = this.myRange.findIndex(v => {
          return v.percent > dragPercent
        })
        //console.log("change" + i)
        this.currentSegmentMin = this.myRange[i-1]
        this.currentSegmentMax = this.myRange[i]
        // this.currentSegmentPercentRange = this.currentSegmentMax.percent - this.currentSegmentMin.percent
        // this.currentSegmentValueRange = this.currentSegmentMax.value - this.currentSegmentMin.value
      }

      // Get drag percent of just this segment
      let segmentPercent = (dragPercent - this.currentSegmentMin.percent) / (this.currentSegmentMax.percent - this.currentSegmentMin.percent)
      let value = this.currentSegmentMin.value + segmentPercent * (this.currentSegmentMax.value - this.currentSegmentMin.value)

      let modulo = (value - this.currentSegmentMin.value) % this.step

      this.dragPercent = dragPercent
      this.segmentPercent = segmentPercent
      this.myValue = value
      this.$emit('input', Math.floor(this.myValue))
      // this.currentPercentage = percentage
      // this.$emit('input', this.between(value - modulo + (Math.abs(modulo) >= this.step / 2 ? (modulo < 0 ? -1 : 1) * this.step : 0), this.currentSegmentMin.value, this.currentSegmentMax.value))

    },
    __updateUsingValue ( value ) {

    },
    __update (e) {
      if (!this.dragging) {
        return
      }
      // Get drag percent of entire control (0 < 1)
      this.__updateUsingDragPercent( this.between((event.position(e).left - this.dragging.left) / this.dragging.width, 0, 1) )
      this.$emit('drag')
      // this.$emit('input', this.animatedNumber)
      //this.$emit('input', this.myValue) // this.between(value, this.min, this.max))
    },
    __end () {
      this.dragging = false
      this.__updateUsingDragPercent(this.myRestPercent)
      this.currentPercentage = (this.value - this.min) / (this.max - this.min)
      this.$emit('stop')
    },
    __validateProps () {
      if (this.min >= this.max) {
        console.error('Range error: min >= max', this.$el, this.min, this.max)
      }
      else if ((this.max - this.min) % this.step !== 0) {
        console.error('Range error: step must be a divisor of max - min', this.$el, this.min, this.max, this.step)
      }
    }
  },
  created () {
    this.__validateProps()
    if (Platform.is.desktop) {
      document.body.addEventListener('mousemove', this.__update)
      document.body.addEventListener('mouseup', this.__end)
    }
  },
  beforeDestroy () {
    if (Platform.is.dekstop) {
      document.body.removeEventListener('mousemove', this.__update)
      document.body.removeEventListener('mouseup', this.__end)
    }
  }
}
</script>

<style lang="stylus">
$primary   ?= #027be3
$secondary ?= #26A69A
$tertiary  ?= #555
$color ?= $primary
$positive  ?= #21BA45
$negative  ?= #DB2828
$info      ?= #31CCEC
$warning   ?= #F2C037

$white     ?= #fff
$light     ?= #f4f4f4
$dark      ?= #333
$faded     ?= #777

$slider-height              = 28px
$slider-track-height        = 7px
$slider-mark-height         = 20px
$slider-handle-size         = 24px
$slider-label-transform     = translateX(-50%) translateY(-139%) scale(1)


.q-slider
  padding-top 10px
  
.q-slider-track, .q-slider-mark
  opacity .4
  background currentColor

.q-slider-track
  position absolute
  top 50%
  left 0
  transform translateY(-50%)
  height $slider-track-height
  width 100%
  &:not(.dragging)
    transition all .3s ease
  &.active-track
    opacity 1
  &.track-draggable.dragging
    height ($slider-track-height * 2)
    transition height .3s ease
  &.handle-at-minimum
    background transparent

.q-slider-mark
  position absolute
  top 50%
  height $slider-mark-height
  width 2px
  transform translateX(-50%) translateY(-50%)

.q-slider-handle-container
  position relative
  height 100%
  margin-left ($slider-handle-size / 2)
  margin-right ($slider-handle-size / 2)

.q-slider-label
  top 0
  left ($slider-handle-size / 2)
  opacity 0
  transform translateX(-50%) translateY(0) scale(0)
  transition all .2s
  padding 5px 9px
  &.label-always
    opacity 1
    transform $slider-label-transform

.q-slider-handle
  position absolute
  top 50%
  transform translate3d(-50%, -50%, 0)
  transform-origin center
  transition all .3s ease
  width $slider-handle-size
  height $slider-handle-size
  &.dragging
    transform translate3d(-50%, -50%, 0) scale(1.3)
    transition opacity .3s ease, transform .3s ease
    .q-slider-label
      opacity 1
      transform $slider-label-transform
  background currentColor
  &.handle-at-minimum
    background white
    &:after
      content ''
      position absolute
      top 0
      right 0
      bottom 0
      left 0
      background transparent
      border-radius inherit
      border 2px solid currentColor

.q-slider-ring
  position absolute
  top -50%
  left -50%
  width 200%
  height 200%
  border-radius inherit
  pointer-events none
  opacity 0
  transform scale(0)
  transition all .2s ease-in
  background currentColor

.q-slider:not(.disabled):not(.readonly)
  &:focus, &:hover
    .q-slider-ring
      opacity .4
      transform scale(1)

.q-slider.disabled
  .q-slider-handle
    border 2px solid white
  .q-slider-handle.handle-at-minimum
    background currentColor


</style>