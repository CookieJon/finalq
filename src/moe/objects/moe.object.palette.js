/*!
 * moe.object.palette v0.0.1
 * (c) 2016 CookieJon
 * Released under the MIT License.
 * https://github.com/CookieJon
 */
/* eslint-disable */

export default Palette

import ColorUtils from '../../moe/utils/moe.utils.color.js'

function Palette () {
  this._type = 'Bitmap'
  this.title = 'Untitled'

  this.colors = []  // 256 array of {r: g: b: , h:, s:, v:, luma:, chroma:} 
 
  this.imageData = null

}

Palette.prototype = {

  constructor: Palette,

  init: () => {
    // default to Material Color palette
    this.title = "Default Palette"
    this.colors = this.generatePaletteColors('default');
  },

}
