const Pixel = require('..').Pixel
const RenderSheet = require('../../rendersheet')
const assert = require('assert')

const GENERAL = require('./general.json')

let sheet, app, general, general2

function test()
{
    general = app.stage.addChild(new Pixel(GENERAL, sheet))
    general.position.set(10, 10)
    general.scale.set(8)
    general.animate('talk')

    general2 = app.stage.addChild(new Pixel(GENERAL, sheet))
    general2.position.set(10, 200)
    general2.scale.set(8)
    general2.animate('walk')

    testLargest()
}

function testLargest()
{
    assert.equal(general.largestWidth(), 12)
    assert.equal(general.largestHeight(), 16)
    assert.equal(Pixel.largestFrameWidth(GENERAL), 12)
    assert.equal(Pixel.largestFrameHeight(GENERAL), 16)
}

function update()
{
    const elapsed = 16.67
    general.update(elapsed)
    general2.update(elapsed)
}

window.onload = async function ()
{
    sheet = new RenderSheet({ scaleMode: true })
    Pixel.add(GENERAL, sheet)
    await sheet.asyncRender()
    app = new PIXI.Application({ autoresize: true, transparent: true })
    document.body.appendChild(app.view)
    PIXI.Ticker.shared.add(update)

    test()
    require('fork-me-github')('https://github.com/davidfig/pixel')
    require('./highlight')()
}