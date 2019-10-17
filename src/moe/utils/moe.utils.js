/* eslint-disable */
export default class MoeUtils {
	constructor () {
	}

	static getPixelSummary(pixels) {
		// Returns shorthand version of 65536 array!
		let out = '', t = 0
		for (var i=0; i<65536; i+= 256 * 16) {
			// Range 0-9 (255/9 = 28.333)
			out += Math.round(pixels[i]/28.4)  + (++t%4 < 1 ? '\n' : '')
		}
		return out
	}


	// ImageData
	//
	static imageDataEmpty() {
		let imgData = new ImageData(256, 256)
		for (let i=0; i< 65536; i++) {
			let mappedIndex = i * 4
			let rgb = i % 2 ? 2 : 100
			imgData.data[mappedIndex] = rgb
			imgData.data[mappedIndex+1] = rgb
			imgData.data[mappedIndex+2] = rgb
			imgData.data[mappedIndex+3] = 255;
		}
		return imgData
	}

	static imageDataFromBitmap(bitmap) {
		if (!bitmap || !bitmap.palette || !bitmap.palette.colors) {
			return
		}
		return MoeUtils.imageDataFromPixelsAndColors({
			pixels: bitmap.pixels,
			colors: bitmap.palette.colors
		})
	}

	static imageDataFromPixelsAndColors({pixels, colors}) {
      let imgData = MoeUtils.imageDataEmpty()
      try {
        for (var i=0; i<65536; i++ ) {
          let mappedIndex = i * 4;
          let theColor = colors[pixels[i]]
          imgData.data[mappedIndex] = theColor.r
          imgData.data[mappedIndex+1] = theColor.g
          imgData.data[mappedIndex+2] = theColor.b
          imgData.data[mappedIndex+3] = 255;
        }
      } catch(e) {
        console.warn('imageDataFromPixelsColors => Render error:', e)
      }
      return imgData
	}

	static imageDataFromPixels(pixels) {
		// Render as greyscale
		let imgData = new ImageData(256, 256)
		try {
			for (var i=0; i<65536; i++ ) {
				let mappedIndex = i * 4;
				let theColor = pixels[i]
				imgData.data[mappedIndex] = theColor
				imgData.data[mappedIndex+1] = theColor
				imgData.data[mappedIndex+2] = theColor
				imgData.data[mappedIndex+3] = 255;
			}
		} catch(e) {
			console.warn('imageDataFromPixels => Render error:', e)
		}
		return imgData
	}

	static imageDataFromColors(colors) {
		// Assumes 256 colors!
		let imageData = new ImageData(256, 256)

		let l = colors.length
		if (!l) return imageData
		let offset = 0
		let colorIndex = 0
		iterateColors:
		for (let y = 0; y < 16; y++) {
		  for (let x = 0; x < 16; x++) {
			for (let yy = 0; yy < 16; yy++) {
			  for (let xx = 0; xx < 16; xx++) {
				offset = (((x * 16) + xx) * 4) +  (((y * 16) + yy) * 256 * 4)
				imageData.data[offset++] = colors[colorIndex].r
				imageData.data[offset++] = colors[colorIndex].g //colors[i].g
				imageData.data[offset++] = colors[colorIndex].b //colors[i].b
				imageData.data[offset++] = colors[colorIndex].a
			  }
			}
			colorIndex++
			if (colorIndex >= l) break iterateColors
		  }
		}
		return imageData

	}
}
