/*!
 * moe.object.artwork v0.0.1
 * (c) 2016 CookieJon
 * Released under the MIT License.
 * https://github.com/CookieJon
 */

 /* eslint-disable */

export default Artwork

import Bitmap from 'moe/moe.objet.js'

function Artwork (options) {
  options = Object.assign({
    // defaults go here
  }, options)

  this.options = Artwork

  this._type = 'Artwork'
  this.id = null
  this.imageData = null // for the icon

  this.title = 'Untitled'

  this.filters = []
  this.palette = null
  this.bitmap = null



}

Artwork.setBitmap = function (oBitmap) {
  this.bitmap = oBitmap
  console.log("set")
}


Artwork.prototype = {

  constructor: Artwork,

  init (options) {

    this.id = 'A'+ parseInt(Math.random()* 10000)

    this.options = options

    var self = this



  },

  render() {

    this.imageData = this.filters[i].render()

  }

}


