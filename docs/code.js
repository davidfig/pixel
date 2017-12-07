const Pixel = require('..').Pixel
const RenderSheet = require('../../rendersheet')
const Renderer = require('yy-renderer')

const GENERAL = require('./general.json')

let sheet, renderer

function test()
{
    const general = renderer.add(new Pixel(GENERAL, sheet))
    general.position.set(10, 10)
    general.scale.set(8)
    general.animate('talk')
    // sheet.show = true
    sheet.render()

    const general2 = renderer.add(new Pixel(GENERAL, sheet))
    general2.position.set(10, 200)
    general2.scale.set(8)
    general2.animate('walk')

    renderer.interval((elapsed) =>
    {
        general.update(elapsed)
        general2.update(elapsed)
    })
}

window.onload = function ()
{
    renderer = new Renderer({ autoresize: true, alwaysRender: true, debug: true })
    sheet = new RenderSheet({ scaleMode: true })
    renderer.canvas.style.position = 'fixed'
    renderer.start()

    test()
    require('fork-me-github')('https://github.com/davidfig/pixel')
    require('./highlight')()
}