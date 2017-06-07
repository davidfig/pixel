const Random = require('yy-random');
const Penner = require('penner');
const Angle = require('yy-angle');

function draw(c, frame)
{
    const pixels = frame.data;
    for (let y = 0; y < frame.height; y++)
    {
        for (let x = 0; x < frame.width; x++)
        {
            const color = pixels[x + y * frame.width];
            if (color !== null)
            {
                let hex = color.toString(16);
                while (hex.length < 6)
                {
                    hex = '0' + hex;
                }
                c.fillStyle = '#' + hex;
                c.beginPath();
                c.fillRect(x, y, 1, 1);
            }
        }
    }
}

function measure(c, params)
{
    return { width: params.width, height: params.height };
}

/**
 * @param {object} data imported from .json (from Pixel-Editor)
 * @param {RenderSheet} sheet - rendersheet for rendering pixel sprite
 * @param {function} callbacks.stop - animation finishes and stops
 * @param {function} callbacks.loop - animation loops
 * @param {function} callbacks.link - animation link to another animation
 * @param {function} callbacks.frame - animation changes frame
 */
class Pixel extends PIXI.Sprite
{
    constructor(data, sheet, callbacks)
    {
        super();
        if (data)
        {
            this.name = data.name;
            this.frames = data.frames;
            this.animations = data.animations;
            this.sheet = sheet;
            this.render();
            this.callbacks = callbacks || {};
        }
    }

    size(index)
    {
        index = index || 0;
        return { width: this.frames[index].width, height: this.frames[index].height };
    }

    render(force)
    {
        if (force || !this.sheet.get(this.name + '-0'))
        {
            for (let i = 0; i < this.frames.length; i++)
            {
                this.sheet.add(this.name + '-' + i, draw, measure, this.frames[i]);
            }
        }
    }

    static add(data, sheet)
    {
        for (let i = 0; i < data.frames.length; i++)
        {
            sheet.add(data.name + '-' + i, draw, measure, data.frames[i]);
        }
    }

    animate(name, reverse)
    {
        this.scale.x = Math.abs(this.scale.x) * (reverse ? -1 : 1);
        this.animation = this.animations[name];
        if (this.animation)
        {
            this.index = 0;
            this.updateFrame(0);
            this.stop = false;
        }
        else
        {
            this.stop = true;
        }
    }

    updateFrame(leftover)
    {
        let entry = this.animation[this.index];
        if (typeof entry[0] === 'string')
        {
            switch (entry[0])
            {
                case 'loop':
                    this.index = 0;
                    entry = this.animation[0];
                    this.updateFrame(leftover);
                    if (this.callbacks.loop)
                    {
                        this.callbacks.loop(this);
                    }
                    return;

                case 'unique':
                    let pick;
                    do
                    {
                        pick = Random.pick(entry[1]);
                    }
                    while (this.last === pick);
                    this.last = pick;
                    entry = [pick, entry[2]];
                    break;

                case 'link':
                    this.animation = this.animations[entry[1]];
                    this.index = 0;
                    this.updateFrame(leftover);
                    if (this.callbacks.link)
                    {
                        this.callbacks.link(this);
                    }
                    return;
            }
        }
        if (Array.isArray(entry[1]))
        {
            this.next = Random.range(entry[1][0], entry[1][1]) + leftover;
        }
        else
        {
            this.next = entry[1] + leftover;
        }
        this.texture = this.sheet.getTexture(this.name + '-' + entry[0]);
        if (this.callbacks.frame)
        {
            this.callbacks.frame(this);
        }
    }

    /**
     * animated movement to a point
     * @param {number} x
     * @param {number} y
     * @param {options} options
     * @param {string} options.ease
     * @param {number} options.duration
     * @param {number} options.speed (n / millisecond)
     */
    move(x, y, options)
    {
        options = options || {};
        this.to = { x, y, originalX: this.x, originalY: this.y, current: 0 };
        if (options.duration)
        {
            this.to.duration = options.duration;
        }
        else
        {
            this.to.duration = options.speed / Math.max(Math.abs(x - this.x), Math.abs(y - this.y));
        }
        this.to.deltaX = x - this.x;
        this.to.deltaY = y - this.y;
        this.to.ease = Penner[options.ease ? options.ease : 'linear'];
    }

    /**
     * animated rotation to a degree
     * @param {number} angle in radian
     * @param {object} options
     * @param {string} options.ease
     * @param {number} options.duration
     * @param {number} options.speed (n / millisecond)
     */
    rotate(to, options)
    {
        options = options || {};
        const difference = this.differenceAngles(to, this.rotation);
        const sign = this.differenceAnglesSign(to, this.rotation);
        const delta = difference * sign;
        this.toRotate = { rotation: to, original: this.rotation, delta, current: 0 };
        if (options.duration)
        {
            this.toRotate.duration = options.duration;
        }
        else
        {
            this.toRotate.duration = options.speed / delta;
        }
        this.toRotate.ease = Penner[options.ease ? options.ease : 'linear'];
    }

    update(elapsed)
    {
        let dirty = false;
        const to = this.to;
        if (to)
        {
            dirty = true;
            to.current += elapsed;
            if (to.current >= to.duration)
            {
                this.position.set(to.x, to.y);
                this.to = null;
            }
            else
            {
                if (to.x)
                {
                    this.x = to.ease(to.current, to.originalX, to.deltaX, to.duration);
                }
                if (to.y)
                {
                    this.y = to.ease(to.current, to.originalY, to.deltaY, to.duration);
                }
            }
        }
        const toRotate = this.toRotate;
        if (toRotate)
        {
            dirty = true;
            toRotate.current += elapsed;
            if (toRotate.current >= toRotate.duration)
            {
                this.rotation = toRotate.rotation;
                this.toRotate = null;
            }
            else
            {
                if (toRotate.current)
                {
                    this.rotation = toRotate.ease(toRotate.current, toRotate.original, toRotate.delta, toRotate.duration);
                }
            }
        }
        if (!this.stop)
        {
            this.next -= elapsed;
            if (this.next <= 0)
            {
                this.index++;
                if (this.index === this.animation.length)
                {
                    this.stop = true;
                    if (this.callbacks.stop)
                    {
                        this.callbacks.stop(this);
                    }
                }
                else
                {
                    this.updateFrame(this.next);
                    dirty = true;
                }
            }
        }
        return dirty;
    }

    frame(i)
    {
        this.texture = this.sheet.getTexture(this.name + '-' + i);
    }
}

module.exports = Pixel;