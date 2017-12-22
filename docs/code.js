const Pixel = require('..').Pixel
const RenderSheet = require('../../rendersheet')
const Renderer = require('yy-renderer')
const assert = require('assert')

const GENERAL = require('./general.json')

let sheet, renderer, general

function test()
{
    general = renderer.add(new Pixel(GENERAL, sheet))
    general.position.set(10, 10)
    general.scale.set(8)
    general.animate('talk')
    // sheet.show = true
    sheet.render()

    const general2 = renderer.add(new Pixel(GENERAL, sheet))
    general2.position.set(10, 200)
    general2.scale.set(8)
    general2.animate('walk')

    renderer.loop.add((elapsed) =>
    {
        general.update(elapsed)
        general2.update(elapsed)
    })

    testLargest()
}

function testLargest()
{
    assert.equal(general.largestWidth(), 12)
    assert.equal(general.largestHeight(), 16)
    assert.equal(Pixel.largestFrameWidth(GENERAL), 12)
    assert.equal(Pixel.largestFrameHeight(GENERAL), 16)
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