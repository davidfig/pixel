const PIXI = require('pixi.js')
const Ease = require('pixi-ease')
const Random = require('yy-random')
const exists = require('exists')

module.exports = class Pixel extends PIXI.Sprite
{
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
    {
        super()
        if (data)
        {
            this.name = data.name
            this.imageData = data.imageData
            this.animations = data.animations
            this.sheet = sheet
            this.animationTime = animationTime || 150
            this.render()
        }
    }

    /**
     * @param {number} index of frame
     * @return {object} returns {width: n, height: m }
     */
    size(index)
    {
        index = index || 0
        return { width: this.imageData[index][0], height: this.imageData[index][1].height }
    }

    /**
     * adds the frames to the RenderSheet
     * @param {boolean} force the render even if sheet already contains these sprites
     */
    render(force)
    {
        if (force || !this.sheet.exists(this.name + '-0'))
        {
            for (let i = 0; i < this.imageData.length; i++)
            {
                this.sheet.addData(this.name + '-' + i, this.imageData[i][2])
            }
        }
    }

    /**
     * adds the frames to the RenderSheet
     * @param {object} data from Pixel-Editor
     * @param {RenderSheet} sheet
     */
    static add(data, sheet)
    {
        for (let i = 0; i < data.imageData.length; i++)
        {
            sheet.addData(data.name + '-' + i, data.imageData[i][2])
        }
    }

    /**
     * adds an individual frame to the rendersheet
     * @param {number} index
     * @param {object} data
     * @param {RenderSheet} sheet
     */
    static addFrame(index, data, sheet)
    {
        sheet.addData(data.name + '-' + index, data.imageData[index][2])
    }

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
    {
        if (options.duration)
        {
            this.moving = new Ease.to(this, { x, y }, options.duration, { ease: options.ease })
        }
        else if (options.speed)
        {
            this.moving = new Ease.target(this, {x, y}, options.speed)
        }
    }

    /**
     * starts a manual animation
     * @param {array} animation
     * @param {boolean} reverse
     * @param {number} time - use this time instead of animationTime
     */
    animateManual(animation, reverse, time)
    {
        this.useTime = time || this.animationTime
        this.scale.x = Math.abs(this.scale.x) * (reverse ? -1 : 1)
        this.animation = animation
        this.index = 0
        this.updateFrame(0)
        this.playing = true
    }

    /**
     * starts a named animation
     * @param {string} name of animation
     * @param {boolean} reverse - flip the sprite
     * @param {number} time - use this time instead of animationTime
     */
    animate(name, reverse, time)
    {
        this.currentAnimation = name
        this.useTime = time || this.animationTime
        this.scale.x = Math.abs(this.scale.x) * (reverse ? -1 : 1)
        const source = this.animations[name]
        const animation = []
        for (let frame of source)
        {
            if (Array.isArray(frame[0]))
            {
                for (let item of frame[0])
                {
                    animation.push([item, frame[1]])
                }
            }
            else
            {
                animation.push(frame)
            }
        }
        this.animation = animation
        if (this.animation)
        {
            this.index = 0
            this.updateFrame(0)
            this.playing = true
        }
        else
        {
            this.playing = false
            this.currentAnimation = ''
        }
    }

    /**
     * stops any animation
     */
    stop()
    {
        this.playing = false
        this.currentAnimation = ''
    }

    /**
     * updates a frame
     * @private
     * @param {number} leftover
     */
    updateFrame(leftover)
    {
        // parse entry
        let entry = this.animation[this.index]
        if (entry === 'loop')
        {
            this.index = 0
            entry = this.animation[0]
            this.updateFrame(leftover)
            this.emit('loop', this)
            return
        }
        else if (Array.isArray(entry))
        {
            if (entry[0] === 'unique')
            {
                let pick
                do
                {
                    pick = Random.pick(entry[1])
                }
                while (this.last === pick)
                this.last = pick
                entry = [pick, exists(entry[2]) ? entry[2] : 1]
            }
            else if (entry[0] === 'link')
            {
                this.animation = this.animations[entry[1]]
                this.index = 0
                this.updateFrame(leftover)
                this.emit('link', this)
                return
            }
            else
            {
                if (!exists(entry[1]))
                {
                    entry[1] = 1
                }
            }
        }
        else
        {
            entry = [entry, 1]
        }

        // calculate time
        if (Array.isArray(entry[1]))
        {
            this.next = this.useTime * Random.range(entry[1][0], entry[1][1]) + leftover
        }
        else
        {
            this.next = this.useTime * entry[1] + leftover
        }
        this.texture = this.sheet.getTexture(this.name + '-' + entry[0])
        this.frameNumber = entry[0]
        this.emit('frame', this)
    }

    /**
     * updates the pixel
     * @param {number} elapsed
     * @return {boolean} whether the sprite changed
     */
    update(elapsed)
    {
        if (this.playing)
        {
            this.next -= elapsed
            if (this.next <= 0)
            {
                this.index++
                if (this.index === this.animation.length)
                {
                    this.playing = false
                    this.currentAnimation = ''
                    this.emit('stop', this)
                }
                else
                {
                    this.updateFrame(this.next)
                    return true
                }
            }
        }
        if (this.moving)
        {
            if (this.moving.update(elapsed))
            {
                this.emit('move-done')
                this.moving = null
            }
            return true
        }
    }

    /**
     * change the sprite to a certain frame
     * @param {number} index of frame
     */
    frame(index)
    {
        this.texture = this.sheet.getTexture(this.name + '-' + index)
        this.frameNumber = index
        this.playing = false
        this.currentAnimation = ''
    }
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

/**
 * used by RenderSheet to render the frame
 * @param {CanvasRenderingContext2D} c
 * @param {object} params
 */
function measure(c, params)
{
    return { width: params.width, height: params.height }
}