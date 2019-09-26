var fs = require('fs'),
    imagediff = require('../../imagediff'),
    Canvas = require('canvas')

function loadImage (url) {
    return new Promise((resolve, reject) => {
        var image = new Canvas.Image()
        fs.readFile(url, function (error, data) {
            if (error) return reject(error)
            image.onload = function () {
                return resolve(image)
            }
            image.src = data
        })
    })

}
const args = process.argv
// console.log(args)
var aName = args[2] || './1_normal_a.jpg'
var bName = args[3] || './1_normal_b.jpg'

Promise.all([ loadImage(aName), loadImage(bName) ]).then((res) => {
    var aData = imagediff.toImageData(res[ 0 ])
    var bData = imagediff.toImageData(res[ 1 ])
    var tolerance = 253
    console.log(' >>>>> equal: ', imagediff.equal(aData, bData, tolerance))
    var diff = imagediff.diff(aData, bData)
    // Now create a canvas,
    var canvas = imagediff.createCanvas(diff.width, diff.height)

    // get its context
    var context = canvas.getContext('2d')

    // and finally draw the ImageData diff.
    context.putImageData(diff, 0, 0)
    const out = fs.createWriteStream(__dirname + '/diff.png')
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () =>  console.log('The PNG file was created.'))

}).catch((err) => {
    console.error(err)
})
