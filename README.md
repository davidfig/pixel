## pixel.js
pixel drawing and animation libraries

## rationale
I use these libraries as part of my Pixel Editor and Animation suite (not yet released publicly).

## Installation
include pixel.js in your project or add to your workflow

    yarn add yy-pixel

## API
### pixel.js
```js
    /**
     * create a sprite with the Pixel-Editor data
     * @param {object} data
     * @param {RenderSheet} sheet
     * @param {object} data imported from .json (from Pixel-Editor)
     * @param {RenderSheet} sheet - rendersheet for rendering pixel sprite
     * @param {number=150} animationTime in milliseconds per frame
     * @event stop - animation finishes and stops
     * @event loop - animation loops
     * @event link - animation link to another animation
     * @event frame - animation changes frame
     * @event move-done - move finishes
     */
    constructor(data, sheet, animationTime)

    /**
     * @param {number} index of frame
     * @return {object} returns {width: n, height: m }
     */
    size(index)

    /**
     * adds the frames to the RenderSheet
     * @param {boolean} force the render even if sheet already contains these sprites
     */
    render(force)

    /**
     * adds the frames to the RenderSheet
     * @param {object} data from Pixel-Editor
     * @param {RenderSheet} sheet
     */
    static add(data, sheet)

    /**
     * adds an individual frame to the rendersheet
     * @param {number} index
     * @param {object} data
     * @param {RenderSheet} sheet
     */
    static addFrame(index, data, sheet)

    /**
     * move sprite to a different location using easing or speed function
     * @param {number} x
     * @param {number} y
     * @param {number} duration
     * @param {object} [options]
     * @param {string|function} [options.ease]
     * @param {number} options.duration
     * @param {number} options.speed (n / millisecond)
     */
    move(x, y, options)

    /**
     * starts a manual animation
     * @param {array} animation
     * @param {boolean} reverse
     * @param {number} time - use this time instead of animationTime
     */
    animateManual(animation, reverse, time)

    /**
     * starts a named animation
     * @param {string} name of animation
     * @param {boolean} reverse - flip the sprite
     * @param {number} time - use this time instead of animationTime
     */
    animate(name, reverse, time)

    /**
     * stops any animation
     */
    stop()

    /**
     * updates the pixel
     * @param {number} elapsed
     * @return {boolean} whether the sprite changed
     */
    update(elapsed)

    /**
     * change the sprite to a certain frame
     * @param {number} index of frame
     */
    frame(index)

/**
 * used by RenderSheet to render the frame
 * @param {CanvasRenderingContext2D} c
 * @param {object} params
 */
function measure(c, params)

```
### pixel-sheet.js
```js
/**
 * sheet of pixels
 * @param {object[]} map
 * @param {string} map.name
 * @param {number} map.x
 * @param {number} map.y
 * @param {number} map.width
 * @param {number} map.height
 * @param {array} data - original data set to pull pixel from
 * @param {RenderSheet} sheet
 */
module.exports = function PixelSheet(map, data, sheet)

```
### pixelart.js
```js
    /**
     * draw and fill rectangle
     * @param {number} x1 - x
     * @param {number} y2 - y
     * @param {number} radius - radius
     * @param {string} color
     * @param {CanvasRenderingContext2D} [c]
     */
    rectFill: function (x1, y1, w, h, color, c)

    /**
     * draw circle
     * from https://en.wikipedia.org/wiki/Midpoint_circle_algorithm
     * @param {number} x0 - x-center
     * @param {number} y0 - y-center
     * @param {number} radius - radius
     * @param {string} color
     * @param {CanvasRenderingContext2D} [c]
     */
    circle: function (x0, y0, radius, color, c)

    /**
     * draw arc
     * @param {number} x0 - x-start
     * @param {number} y0 - y-start
     * @param {number} radius - radius
     * @param {number} start angle (radians)
     * @param {number} end angle (radians)
     * @param {string} color
     * @param {CanvasRenderingContext2D} [c]
     */
    arc: function (x0, y0, radius, start, end, color, c)

    /**
     * draw and fill circle
     * @param {number} x0 - x-center
     * @param {number} y0 - y-center
     * @param {number} radius - radius
     * @param {string} color
     * @param {CanvasRenderingContext2D} [c]
     */
    circleFill: function (x0, y0, radius, color, c)

    /**
     * draw ellipse
     * from http://cfetch.blogspot.tw/2014/01/wap-to-draw-ellipse-using-midpoint.html
     * @param {number} xc - x-center
     * @param {number} yc - y-center
     * @param {*} rx - radius x-axis
     * @param {*} ry - radius y-axis
     * @param {string} color
     * @param {CanvasRenderingContext2D} [c]
     */
    ellipse(xc, yc, rx, ry, color, c)

    /**
     * draw and fill ellipse
     * @param {number} xc - x-center
     * @param {number} yc - y-center
     * @param {number} rx - radius x-axis
     * @param {number} ry - radius y-axis
     * @param {string} color
     * @param {CanvasRenderingContext2D} [c]
     */
    ellipseFill(xc, yc, rx, ry, color, c)

    /**
     * draw and fill polygon
     * @param {number[]} vertices
     * @param {string} color
     * @param {CanvasRenderingContext2D} [c]
     */
    polygonFill: function (vertices, color, c)

    /**
     * gets data for use with yy-pixel.Pixel file format
     * @param {number} x0 - starting point in canvas
     * @param {number} y0
     * @param {number} width
     * @param {number} height
     * @param {HTMLContext} c
     */
    getPixels: function (x0, y0, width, height, c)

```
## license  
MIT License  
(c) 2017 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
