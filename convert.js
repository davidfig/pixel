const jsonfile = require('jsonfile')
const Canvas = require('canvas')
const exists = require('exists')

for (let i = 2; i < process.argv.length; i++)
{
    const source = process.argv[i]
    if (source.indexOf('.editor.') !== -1)
    {
        continue
    }
    const original = jsonfile.readFileSync(source)

    const imageData = []
    for (let i = 0; i < original.frames.length; i++)
    {
        const frame = original.frames[i]
        imageData[i] = [frame.width, frame.height]
        const canvas = new Canvas(frame.width, frame.height)
        const c = canvas.getContext('2d')
        draw(c, frame)
        imageData[i].push(canvas.toDataURL().replace(/^data:image\/(png|jpg);base64,/, ''))
    }

    const save = { name: original.name, animations: original.animations, imageData }
    jsonfile.writeFileSync(source, save)
}

/**
 * used by RenderSheet to render the frame
 * @private
 * @param {CanvasRenderingContext2D} c
 * @param {object} frame
 */
function draw(c, frame)
{
    const pixels = frame.data
    for (let y = 0; y < frame.height; y++)
    {
        for (let x = 0; x < frame.width; x++)
        {
            const color = pixels[x + y * frame.width]
            if (exists(color))
            {
                let hex = color.toString(16)
                while (hex.length < 6)
                {
                    hex = '0' + hex
                }
                c.fillStyle = '#' + hex
                c.beginPath()
                c.fillRect(x, y, 1, 1)
            }
        }
    }
}