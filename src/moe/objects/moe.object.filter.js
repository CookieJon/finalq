/*!
 * moe.object.filter v0.0.1
 * (c) 2016 CookieJon
 * Released under the MIT License.
 * https://github.com/CookieJon
 */

 /* eslint-disable */

export default Filter

function Filter (options) {
  options = Object.assign({
    // defaults go here
  }, options)

  this.options = options

  this._type = 'Filter'
  this.title = 'Untitled'

  this.bitmap = null
  this.filterType = null

}

Filter.prototype = {

  constructor: Filter,

  init (options) {

    this.options = options

    var self = this

  },

  execute (input) {
    //

  }


}

