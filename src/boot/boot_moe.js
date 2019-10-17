

// Moe Cusatom Components
import jArtwork from 'components/custom/j-artwork'
import jBitmap from 'components/custom/j-bitmap'
import jCanvas from 'components/custom/j-canvas'
import jCollection from 'components/custom/j-collection'
import jItem from 'components/custom/j-item'
import jLever from 'components/custom/j-lever'
import jObject from 'components/custom/j-object'
import jPanel from 'components/custom/j-panel'
import jUploadZone from 'src/components/custom/j-upload-zone'

// "async" is optional
export default async ({ Vue }) => {
  Vue.mixin({
    components: {
      jArtwork, jBitmap, jCanvas, jCollection, jItem, jLever, jObject, jPanel, jUploadZone
    }
  })
}
