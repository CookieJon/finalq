
 <template>
 <div>
    <div
      ref="container"
      :class='computedClass'
      @click.stop.prevent="openFileInput"
      @dragenter.stop.prevent="doDragEnter"
      @dragover.stop.prevent="doDragOver"
      @drop.stop.prevent="doDrop"
    >
    <slot></slot>    
  </div>
  <input
    type="file"
    ref="fileinput"
    class="file-upload"
    name="userprofile_picture"
    multiple="multiple"
    @change.stop.prevent="doSelect"
  />
 </div>
</template>

<script>
/* eslint-disable */
  var iq = require('image-q')
  console.log(iq)
  export default {
    props: {
      'cssClass': {
        type: String,
        default: ''
      }
    },
    data () {
      return {}
    },
    computed: {
      computedClass () {
        return ['upload-zone', this.cssClass]
      }
    },
    methods: {
      openFileInput (e) {
        this.$refs.fileinput.click()
      },
      doDragEnter (e) {
        e.stopPropagation()
        e.preventDefault()
      },
      doDragOver (e) {
        e.stopPropagation()
        e.preventDefault()
      },
      doDrop (e) {
        // User drag-dropped from file explorer to dropzone
        console.log('upload-zone dnDrop:', e)
        let
          dt = event.dataTransfer,
          html = dt.getData('text/html'),
          src = html.match(/src\s*=\s*"(.+?)"/)
          
        if (dt.files.length) {
          console.log('dropped files')
          this.__addBitmaps(dt.files)
        } 
        else if (src) {
          console.log('dropped text/html->src=')
          src = src[1]
          var img = new Image()
          img.onload = e => this.$actions.addBitmap({image: img})
          img.src = src
        } 
        else (
          console.log('dropped nothing I deal with')

        )
        // console.log('text/html', dt.getData('text/html'))
        // var url = dt.getData('url')
        // if (!url) {
        //   url = dt.getData('text/plain')
        //   if (!url) {
        //     url = dt.getData('text/uri-list')
        //     if (!url) {
        //       // We have tried all that we can to get this url but we can't. Abort mission
        //     }
        //   }
        // }
        // if (url.match(/http.*/)) {
        //   alert('new img url:' + url)
        //   console.log(url)
        //   var img = new Image()
        //   img.onload = function (e) {
        //     alert(img.src)
        //     this.$actions.addBitmap({image: img})
        //   }
        //   img.src = url
        // }
        // else {
        //   this.__addBitmaps(e.dataTransfer.files)
        // }
      },

      doSelect (e) {
        this.$emit('select', e.target.files)
        // User selected files from the fileupload
        // alert('doSelect')
        ////this.__addBitmaps(e.target.files)
      },

      __addBitmaps (files) {
        // Add the dropped or selected files
        for (let i = 0; i < files.length; i++) {
          let file = files[i]
          if (file.type.match(/image.*/)) {
            this.$actions.addBitmap({file})
          }
          else {
            alert('File not an image.')
          }
        }
      }
    }
  }
</script>

<style>

  .upload-zone {
    position:relative;
    overflow:hidden;
    width:100%;
    min-height:45px;
    background:transparent;
    border:2px dashed #333;
    cursor:pointer; padding:5px; color:#555; font-family:'Segoe UI'; font-weight:bold;
  }
  .upload-zone:hover {
    border-color: green;
  }

  .file-upload{
    display:none;
  }

  .upload-zone img {
    position:absolute;
    width:312px;
    height:362px;
    top:-1px;
    left:-1px;
    z-index:-1;
    border:none;
    background-color: #eee;
  }
</style>
