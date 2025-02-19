<template>
    <canvas
        ref="canvasRef"
        :id="id"
        class="timeline-bar h5-timeline"
        @dragstart="() => {return false;}"
        @mousemove="mousemoveFunc"
        @mouseout="mouseoutFunc"
        @mousedown="mousedownFunc"
        @mouseup="mouseupFunc"
        @dblclick="dblclickFunc"
        @mousewheel="mousewheelFunc"
        :style="{cursor: inPick ?'e-resize' : 'pointer'}"
    />
</template>
<script>
import moment from 'moment'

const MINUTES_PER_STEP = [
    1,
    2,
    5,
    10,
    15,
    20,
    30,
    60,
    120,
    180,
    240,
    360,
    720,
    1440
]
const ZOOM = [0.2, 1, 2, 6, 12, 24]
// px/格 默认最小值20px
const GRADUATION_STEP = 20
// 时间轴显示f范围
let hoursPerRuler = 24
const DISTANCE_BETWEEN_GTITLE = 80
const ONE_HOUR = 60 * 60 * 1000
const RANGE_OFFSET = 8
export default {
    name: 'timeline',
    props: {
        id: {
            type: [String, Number],
            required: true
        },
        width: {
            type: [String, Number],
            required: true
        },
        height: {
            type: [String, Number],
            required: false,
            default: 40
        },
        timeSegments: {
            type: Array,
            default: () => []
        },
        seekRange: {
            type: Array
        },
        pickMode: {
            type: Boolean,
            default: false
        },
        defaultZoom: {
            type: Number,
            default: 5
        }
    },
    data() {
        return {
            timer: null,
            ctx: null,
            zoom: 5,
            currentTime: 0,
            startTimestamp: new Date(moment().format('YYYY-MM-DD 00:00:00')).getTime() - 12 * ONE_HOUR,
            isMouseDown: false,
            isMouseMove: false,
            mouseDownCursor: null,
            selectRangeStart: 0,
            selectRangeEnd: 0,
            inPick: false,
            isPicking: false,
            isPickLeft: null
        }
    },
    computed: {
        selectRangeStartX() {
            const {selectRangeStart, startTimestamp} = this
            const PX_PER_MS = this.width / (hoursPerRuler * 60 * 60 * 1000) // px/ms

            return (new Date(selectRangeStart) - startTimestamp) * PX_PER_MS
        },
        selectRangeEndX() {
            const {selectRangeEnd, startTimestamp} = this
            const PX_PER_MS = this.width / (hoursPerRuler * 60 * 60 * 1000) // px/ms

            return (new Date(selectRangeEnd) - startTimestamp) * PX_PER_MS
        }
    },
    watch: {
        currentTime(val) {
            this.$emit('current-time', val)
        },
        width() {
            const canvas = document.getElementById(this.id)
            this.ctx = canvas.getContext('2d')
            canvas.width = this.width
            this.initTimeline(this.ctx)
        },
        timeSegments(val) {
            this.$nextTick(() => {
                this.clearCanvas(this.ctx, this.width, this.height)
                this.initTimeline(this.ctx)
            })
        },
        defaultZoom: {
            handler(newVal, oldVal) {
                this.zoom = this.defaultZoom
                hoursPerRuler = ZOOM[this.zoom]
                if (!this.ctx) {
                    return
                }
                const lastHoursPerRuler = ZOOM[oldVal]
                let middleTime = this.startTimestamp + (lastHoursPerRuler * 3600 * 1000) / 2 // ms 记住当前中间的时间
                this.clearCanvas(this.ctx, this.width, this.height)
                this.startTimestamp = middleTime - (hoursPerRuler * 3600 * 1000) / 2 // startTimestampp = 当前中间的时间 - zoom/2
                this.initTimeline(this.ctx)
            },
            immediate: true
        }
    },
    mounted() {
        const canvas = document.getElementById(this.id)
        this.ctx = canvas.getContext('2d')
        canvas.width = this.width
        canvas.height = this.height
        this.selectRangeStart = this.startTimestamp + (hoursPerRuler * 3600 * 1000) / 2 - hoursPerRuler * 37.5 * 1000
        this.selectRangeEnd = this.startTimestamp + (hoursPerRuler * 3600 * 1000) / 2 + hoursPerRuler * 37.5 * 1000
        this.initTimeline(this.ctx)

        window.addEventListener('mouseup', this.mouseupFunc.bind(this))

        if (/Firefox/i.test(navigator.userAgent)) {
            this.$refs.canvasRef.addEventListener('DOMMouseScroll', this.mousewheelFunc)
        }
    },
    methods: {
        initTimeline(ctx) {
            this.drawCellBg(ctx)
            this.drawRangeBg(ctx)
            this.addGraduations(ctx, this.startTimestamp)
            this.addTimeSegments(ctx, this.timeSegments)
            this.drawLine(
                ctx,
                this.width / 2,
                0,
                this.width / 2,
                this.height,
                'rgb(255, 255, 255)',
                2
            )
            this.pickMode && this.drawRange(ctx)
            this.currentTime = this.startTimestamp + (hoursPerRuler * 3600 * 1000) / 2
        },
        drawCellBg(ctx) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
            ctx.fillRect(0, 0, this.width, this.height * 0.3)
        },
        drawRangeBg(ctx) {
            if (!this.seekRange) return

            const [startTime, endTime] = this.seekRange
            const PX_PER_MS = this.width / (hoursPerRuler * 60 * 60 * 1000) // px/ms

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
            if (startTime) {
                const timeWidth = (new Date(startTime) - this.startTimestamp) * PX_PER_MS
                ctx.fillRect(
                    0,
                    0,
                    timeWidth,
                    this.height
                )
            }

            if (endTime) {
                const timeWidth = (new Date(endTime) - this.startTimestamp) * PX_PER_MS
                ctx.fillRect(
                    timeWidth,
                    0,
                    this.width - timeWidth,
                    this.height
                )
            }
        },
        addGraduations(ctx, startTimestamp) {
            let pxPerStep
            const PX_PER_MIN = this.width / (hoursPerRuler * 60) // px/min
            const PX_PER_MS = this.width / (hoursPerRuler * 60 * 60 * 1000) // px/ms
            let minPerStep = GRADUATION_STEP / PX_PER_MIN // min/格
            for (let i = 0; i < MINUTES_PER_STEP.length; i++) {
                if (minPerStep <= MINUTES_PER_STEP[i]) {
                    // 让每格时间在minutes_per_step规定的范围内
                    minPerStep = MINUTES_PER_STEP[i]
                    pxPerStep = PX_PER_MIN * minPerStep
                    break
                }
            }
            // TODO: 没有弄明白这个是什么意思
            let mediumStep = 30
            for (let i = 0; i < MINUTES_PER_STEP.length; i++) {
                if (DISTANCE_BETWEEN_GTITLE / PX_PER_MIN <= MINUTES_PER_STEP[i]) {
                    mediumStep = MINUTES_PER_STEP[i]
                    break
                }
            }

            let stepTotalNum = this.width / pxPerStep // 总格数
            let graduationLeft
            let graduationTime
            let lineH
            let msOffset = this.msToNextStep(startTimestamp, minPerStep * 60 * 1000) // 开始的偏移时间 ms
            let pxOffset = msOffset * PX_PER_MS // 开始的偏移距离 px
            let msPerStep = pxPerStep / PX_PER_MS // ms/step
            for (let i = 0; i < stepTotalNum; i++) {
                graduationLeft = pxOffset + i * pxPerStep // 距离=开始的偏移距离+格数*px/格
                graduationTime = startTimestamp + msOffset + i * msPerStep // 时间=左侧开始时间+偏移时间+格数*ms/格
                let date = new Date(graduationTime)
                if (date.getHours() === 0 && date.getMinutes() === 0) {
                    lineH = this.height * 0.3
                    ctx.fillStyle = 'rgba(151,158,167,1)'
                    ctx.fillText(
                        this.graduationTitle(graduationTime),
                        graduationLeft - 10,
                        30
                    )
                } else if ((graduationTime / (60 * 1000)) % mediumStep === 0) {
                    lineH = this.height * 0.2
                    ctx.fillStyle = 'rgba(151,158,167,1)'
                    ctx.fillText(
                        this.graduationTitle(graduationTime),
                        graduationLeft - 10,
                        30
                    )
                } else {
                    lineH = this.height * 0.15
                }
                this.drawLine(
                    ctx,
                    graduationLeft,
                    0,
                    graduationLeft,
                    lineH,
                    'rgba(151,158,167,1)',
                    1
                )
            }
        },
        graduationTitle(datetime) {
            let time = moment(datetime)
            if (
                time.hours() === 0 &&
                time.minutes() === 0 &&
                time.milliseconds() === 0
            ) {
                return time.format('MM-DD')
            } else {
                return time.format('HH:mm')
            }
        },

        msToNextStep(timestamp, step) {
            let remainder = timestamp % step
            return remainder ? step - remainder : 0
        },

        drawLine(ctx, beginX, beginY, endX, endY, color, width) {
            ctx.beginPath()
            ctx.moveTo(beginX, beginY)
            ctx.lineTo(endX, endY)
            ctx.strokeStyle = color
            ctx.lineWidth = width
            ctx.stroke()
        },

        drawRange(ctx) {
            const {selectRangeStartX, selectRangeEndX, height} = this

            const top = 1
            const bottom = height - 2

            ctx.beginPath()
            ctx.moveTo(selectRangeStartX + RANGE_OFFSET, top)
            ctx.lineTo(selectRangeStartX, top)
            ctx.lineTo(selectRangeStartX, bottom)
            ctx.lineTo(selectRangeStartX + RANGE_OFFSET, bottom)
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(selectRangeEndX - RANGE_OFFSET, top)
            ctx.lineTo(selectRangeEndX, top)
            ctx.lineTo(selectRangeEndX, bottom)
            ctx.lineTo(selectRangeEndX - RANGE_OFFSET, bottom)
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
            ctx.fillRect(
                selectRangeStartX,
                0,
                selectRangeEndX - selectRangeStartX,
                height
            )
        },

        addTimeSegments(ctx, timeSegments) {
            timeSegments.forEach(timeSegment => {
                this.drawTimeSegments(ctx, timeSegment)
            })
        },
        drawTimeSegments(ctx, timeSegment) {
            const PX_PER_MS = this.width / (hoursPerRuler * 60 * 60 * 1000) // px/ms
            let beginX = (timeSegment.beginTime - this.startTimestamp) * PX_PER_MS
            let timeSegmentwidth =
                (timeSegment.endTime - timeSegment.beginTime) * PX_PER_MS
            ctx.fillStyle = timeSegment.style.background;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(
                beginX,
                0,
                timeSegmentwidth,
                this.height
            );
        },
        clearCanvas(ctx, endX, endY) {
            ctx.clearRect(0, 0, endX, endY)
        },
        checkRange(time) {
            if (!this.seekRange) return true

            const [startTime, endTime] = this.seekRange

            if (startTime && !moment(time).isAfter(startTime)) {
                return false
            }

            if (endTime && !moment(time).isBefore(endTime)) {
                return false
            }

            return true
        },
        /**
         * @author xuzilong
         * @desc 判断是否满足拖动区域
         */
        checkInPick(x) {
            if (!this.pickMode) return false

            const {selectRangeStartX, selectRangeEndX} = this
            return (x <= selectRangeStartX + RANGE_OFFSET && x >= selectRangeStartX - RANGE_OFFSET) ||
                (x <= selectRangeEndX + RANGE_OFFSET && x >= selectRangeEndX - RANGE_OFFSET)
        },
        /**
         * @author xuzilong
         * @desc 判断拖动的是否是左边的
         */
        checkPickIsLeft(x) {
            const {selectRangeStartX} = this

            if (!this.checkInPick(x)) return

            return x <= selectRangeStartX + RANGE_OFFSET && x >= selectRangeStartX - RANGE_OFFSET
        },
        mousemoveFunc(e) {
            const PX_PER_MS = this.width / (hoursPerRuler * 60 * 60 * 1000) // px/ms
            let posX = e.offsetX
            if (this.isMousedown) {
                let diffX = posX - this.mousedownCursor
                if (this.isPicking) {
                    // 拖动范围选择器
                    if (this.isPickLeft !== false && (this.checkPickIsLeft(posX) === true || this.isPickLeft === true)) {
                        this.selectRangeStart = this.selectRangeStart + Math.round(diffX / PX_PER_MS)
                        this.isPickLeft = true
                    } else if (this.checkPickIsLeft(posX) === false || this.isPickLeft === false) {
                        this.selectRangeEnd = this.selectRangeEnd + Math.round(diffX / PX_PER_MS)
                        this.isPickLeft = false
                    }
                    this.isPicking = true
                    if (this.selectRangeStart > this.selectRangeEnd) {
                        // 如果开始时间大于结束时间，双方值互换，判断条件取反
                        [this.selectRangeStart, this.selectRangeEnd] = [this.selectRangeEnd, this.selectRangeStart]
                        this.isPickLeft = !this.isPickLeft
                    }
                } else {
                    // 拖动时间轴
                    const currentTime = this.startTimestamp - Math.round(diffX / PX_PER_MS) + (hoursPerRuler * 3600 * 1000) / 2
                    if (this.checkRange(currentTime)) {
                        this.startTimestamp = this.startTimestamp - Math.round(diffX / PX_PER_MS)
                    }
                }
                this.clearCanvas(this.ctx, this.width, this.height)
                this.initTimeline(this.ctx)
                this.isMousemove = true
                this.mousedownCursor = posX
            } else {
                let time = this.startTimestamp + posX / PX_PER_MS
                this.$emit('mousemove-time', time)
                this.clearCanvas(this.ctx, this.width, this.height)
                this.initTimeline(this.ctx)
                this.drawLine(this.ctx, posX, 0, posX, 40, 'rgb(255, 255, 255)', 1)
                this.ctx.fillStyle = '#fff'
                this.ctx.fillText(
                    moment(time).format('YYYY-MM-DD HH:mm:ss'),
                    posX + 3,
                    20
                )
                this.inPick = this.checkInPick(posX)
            }
        },
        mouseoutFunc() {
            this.clearCanvas(this.ctx, this.width, this.height)
            this.initTimeline(this.ctx)
        },
        mousedownFunc(e) {
            this.isMousedown = true
            this.mousedownCursor = e.offsetX // 记住mousedown的位置
            if (this.pickMode && this.checkInPick(e.offsetX)) {
                this.isPicking = true
            }
        },
        mouseupFunc(e) {
            if (this.isMousemove) {
                // 拖动 事件
                this.isMousemove = false
                this.isMousedown = false
                this.isPicking = false
                this.isPickLeft = null
                this.currentTime =
                    this.startTimestamp + (hoursPerRuler * 3600 * 1000) / 2

                // 找到所在的时间段
                let timeSegment =
                    this.timeSegments
                        .find(
                            item => moment(this.currentTime).isBetween(item.beginTime, item.endTime)
                        )

                this.$emit('mouseup', e, this.currentTime, timeSegment)
            }
        },
        dblclickFunc(e) {
            this.isMousedown = false
            let msPerPx = (ZOOM[this.zoom] * 3600 * 1000) / this.width // ms/px
            const currentTime = this.startTimestamp + e.offsetX * msPerPx
            if (!this.checkRange(currentTime)) return
            this.currentTime = currentTime
            this.setTimeToMiddle(this.currentTime)

            this.$emit('dbl-click', e, this.currentTime)
        },
        mousewheelFunc(event) {
            if (event && event.preventDefault) {
                event.preventDefault()
            } else {
                window.event.returnValue = false
                return false
            }

            let e = window.event || event
            let delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
            let middleTime = this.startTimestamp + (hoursPerRuler * 3600 * 1000) / 2 // ms 记住当前中间的时间
            if (delta < 0) {
                this.zoom = this.zoom + 1
                if (this.zoom >= 5) {
                    this.zoom = 5
                }
                hoursPerRuler = ZOOM[this.zoom]
            } else if (delta > 0) {
                // 放大
                this.zoom = this.zoom - 1
                if (this.zoom <= 0) {
                    this.zoom = 0
                }
                hoursPerRuler = ZOOM[this.zoom]
            }

            this.clearCanvas(this.ctx, this.width, this.height)
            this.startTimestamp = middleTime - (hoursPerRuler * 3600 * 1000) / 2 // startTimestampp = 当前中间的时间 - zoom/2
            this.initTimeline(this.ctx)
        },
        setTimeToMiddle(time) {
            if (this.isMousemove) return
            this.clearCanvas(this.ctx, this.width, this.height)
            this.startTimestamp = time - (hoursPerRuler * 60 * 60 * 1000) / 2
            this.initTimeline(this.ctx)
        },
        startPlay(speed = 1, onlyInTimeSegment) {
            clearInterval(this.timer)
            this.timer = setInterval(() => {
                this.currentTime += 16 * speed
                if (onlyInTimeSegment) {
                    if (this.timeSegments.find(item => moment(this.currentTime).isBetween(item.beginTime, item.endTime)) || this.isMousemove) {
                        this.setTimeToMiddle(this.currentTime)
                    } else {
                        clearInterval(this.timer)
                        this.timer = null
                        this.$emit('stop-play')
                    }
                } else {
                    this.setTimeToMiddle(this.currentTime)
                }
            }, 16)
        },
        stopPlay() {
            clearInterval(this.timer)
            this.timer = null
        }
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer)
        }

        window.removeEventListener('mouseup', this.mouseupFunc.bind(this))

        this.$refs.canvasRef.removeEventListener('DOMMouseScroll', this.mousewheelFunc)
    },
}
</script>

<style scoped>
.timeline-bar {
    cursor: pointer;
    border: 1px solid #000;
    background-color: #000;
}
</style>
