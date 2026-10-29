/**
 * flw — optional JS helpers for terminal-style UI widgets.
 * Framework-agnostic; CSS works without this file.
 */
(function (global) {
  'use strict'

  const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  const SPINNER_INTERVAL = 80

  const cleanups = new WeakMap()

  function reducedMotion() {
    return typeof global.matchMedia === 'function' &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const BAR_COLORS = ['green', 'orange', 'red', 'blue', 'purple', 'white', 'gray']

  // base color is identity (cpu green, mem blue …); severity overrides it
  function severityClass(pct, base) {
    if (pct > 90) return 'flw-progress__bar--red'
    if (pct > 70) return 'flw-progress__bar--orange'
    return `flw-progress__bar--${base || 'green'}`
  }

  function glyphBar(pct, width) {
    const clamped = Math.min(100, Math.max(0, pct))
    const filled = Math.round((clamped / 100) * width)
    return '█'.repeat(filled) + '░'.repeat(width - filled)
  }

  function cleanup(el) {
    const fn = cleanups.get(el)
    if (fn) {
      fn()
      cleanups.delete(el)
    }
  }

  function spinner(el) {
    cleanup(el)
    const charEl = el.querySelector('.flw-spinner__char') || el

    let index = 0
    charEl.textContent = SPINNER_FRAMES[0]
    if (reducedMotion()) return

    const id = setInterval(() => {
      index = (index + 1) % SPINNER_FRAMES.length
      charEl.textContent = SPINNER_FRAMES[index]
    }, SPINNER_INTERVAL)

    cleanups.set(el, () => clearInterval(id))
  }

  const SPARK_CHARS = '▁▂▃▄▅▆▇█'

  function sparkline(values, min, max) {
    if (!values.length) return ''
    const lo = Number.isFinite(min) ? min : Math.min(...values)
    const hi = Number.isFinite(max) ? max : Math.max(...values)
    const span = hi - lo || 1
    return values
      .map((v) => {
        const t = (Math.min(hi, Math.max(lo, v)) - lo) / span
        return SPARK_CHARS[Math.round(t * (SPARK_CHARS.length - 1))]
      })
      .join('')
  }

  function spark(el, values, options) {
    const opts = options || {}
    const min = opts.min ?? (el.dataset.flwSparkMin === undefined ? NaN : Number(el.dataset.flwSparkMin))
    const max = opts.max ?? (el.dataset.flwSparkMax === undefined ? NaN : Number(el.dataset.flwSparkMax))
    el.textContent = sparkline(values, min, max)
  }

  // vertical cells, bottom up; color by height: green, orange above 70 %, red above 90 %
  function meter(el, pct, options) {
    const opts = options || {}
    const height = opts.height || Number(el.dataset.flwMeterHeight) || 8
    const width = opts.width || Number(el.dataset.flwMeterWidth) || 1
    const clamped = Math.min(100, Math.max(0, pct))
    el.textContent = ''
    for (let row = height; row >= 1; row--) {
      const top = (row / height) * 100
      const cell = document.createElement('span')
      const on = clamped >= top - 100 / height / 2
      cell.textContent = (on ? '█' : '░').repeat(width)
      if (on) {
        const level = top > 90 ? 'peak' : top > 70 ? 'warn' : 'on'
        cell.className = `flw-meter__cell--${level}`
      }
      el.appendChild(cell)
    }
  }

  function shadeLevel(pct) {
    if (pct >= 80) return 3
    if (pct >= 50) return 2
    if (pct >= 20) return 1
    return 0
  }

  function shade(el, pct) {
    el.classList.remove('flw-shade--1', 'flw-shade--2', 'flw-shade--3')
    const level = shadeLevel(pct)
    if (level) el.classList.add(`flw-shade--${level}`)
  }

  function bar(el, pct, options) {
    const opts = options || {}
    const width = opts.width || Number(el.dataset.flwBarWidth) || 20
    const showValue = opts.showValue !== false
    const color = opts.color || el.dataset.flwBarColor
    const clamped = Math.min(100, Math.max(0, pct))

    const barEl = el.querySelector('.flw-progress__bar') || el
    barEl.textContent = glyphBar(clamped, width)
    barEl.classList.remove(...BAR_COLORS.map((c) => `flw-progress__bar--${c}`))
    barEl.classList.add(severityClass(clamped, color))

    if (showValue) {
      const valueEl = el.querySelector('.flw-progress__value')
      if (valueEl) valueEl.textContent = `${Math.round(clamped)}%`
    }
  }

  // min / max / step / decimals of a numeric input (range, number or text);
  // 'any' step falls back to 1 % of the span
  function numberSpec(input, fallbackMin, fallbackMax) {
    const stepAttr = input.getAttribute('step') || '1'
    const minAttr = input.getAttribute('min')
    const maxAttr = input.getAttribute('max')
    const min = minAttr === null ? fallbackMin : Number(minAttr)
    const max = maxAttr === null ? fallbackMax : Number(maxAttr)
    const span = Number.isFinite(max - min) ? max - min : 100
    const step = stepAttr === 'any' ? span / 100 : Number(stepAttr)
    const decimals = stepAttr === 'any' ? 2 : (stepAttr.split('.')[1] || '').length
    return { min, max, step, decimals }
  }

  // accepts a decimal comma while typing
  function readNumber(input) {
    return Number(String(input.value).replace(',', '.')) || 0
  }

  function setNumber(input, value, spec) {
    const base = Number.isFinite(spec.min) ? spec.min : 0
    const snapped = base + Math.round((value - base) / spec.step) * spec.step
    const clamped = Math.min(spec.max, Math.max(spec.min, snapped))
    const next = clamped.toFixed(spec.decimals)
    if (input.value === next) return
    input.value = next
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  // shift + arrows move ten steps (plain arrows stay native: one step)
  function coarseKeys(input, spec) {
    return (event) => {
      const dir = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key]
      if (!event.shiftKey || !dir) return
      event.preventDefault()
      setNumber(input, readNumber(input) + dir * spec.step * 10, spec)
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  function range(el) {
    cleanup(el)
    const input = el.querySelector('.flw-range__input')
    if (!input) return
    const valueEl = el.querySelector('.flw-range__value')
    const spec = numberSpec(input, 0, 100)

    const update = () => {
      if (valueEl) valueEl.textContent = Number(input.value).toFixed(spec.decimals)
    }
    const onKey = coarseKeys(input, spec)

    update()
    input.addEventListener('input', update)
    input.addEventListener('keydown', onKey)

    cleanups.set(el, () => {
      input.removeEventListener('input', update)
      input.removeEventListener('keydown', onKey)
    })
  }

  // Drag a number sideways: 1 step per px, shift x10. Click without dragging edits it.
  function scrub(el) {
    cleanup(el)
    const input = el.querySelector('.flw-scrub__input')
    if (!input) return
    const spec = numberSpec(input, -Infinity, Infinity)
    let pointerId = null
    let lastX = 0
    let moved = 0
    let raw = 0

    const onDown = (event) => {
      if (event.button !== 0 || document.activeElement === input) return
      event.preventDefault()
      pointerId = event.pointerId
      lastX = event.clientX
      moved = 0
      raw = readNumber(input)
      input.setPointerCapture(pointerId)
    }

    const onMove = (event) => {
      if (event.pointerId !== pointerId) return
      const dx = event.clientX - lastX
      lastX = event.clientX
      moved += Math.abs(dx)
      if (moved < 3) return
      el.classList.add('flw-scrub--active')
      raw += dx * spec.step * (event.shiftKey ? 10 : 1)
      raw = Math.min(spec.max, Math.max(spec.min, raw))
      setNumber(input, raw, spec)
    }

    const onUp = (event) => {
      if (event.pointerId !== pointerId) return
      input.releasePointerCapture(pointerId)
      pointerId = null
      if (el.classList.contains('flw-scrub--active')) {
        el.classList.remove('flw-scrub--active')
        input.dispatchEvent(new Event('change', { bubbles: true }))
      } else {
        input.focus()
        input.select()
      }
    }

    // typed values get clamped and snapped like dragged ones
    const onChange = () => setNumber(input, readNumber(input), spec)

    // up / down step (shift x10); left / right stay with the caret
    const onKey = (event) => {
      const dir = { ArrowUp: 1, ArrowDown: -1 }[event.key]
      if (!dir) return
      event.preventDefault()
      setNumber(input, readNumber(input) + dir * spec.step * (event.shiftKey ? 10 : 1), spec)
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }

    const syncAria = () => input.setAttribute('aria-valuenow', String(readNumber(input)))

    input.setAttribute('role', 'spinbutton')
    if (Number.isFinite(spec.min)) input.setAttribute('aria-valuemin', String(spec.min))
    if (Number.isFinite(spec.max)) input.setAttribute('aria-valuemax', String(spec.max))
    syncAria()

    input.addEventListener('pointerdown', onDown)
    input.addEventListener('pointermove', onMove)
    input.addEventListener('pointerup', onUp)
    input.addEventListener('pointercancel', onUp)
    input.addEventListener('change', onChange)
    input.addEventListener('keydown', onKey)
    input.addEventListener('input', syncAria)

    cleanups.set(el, () => {
      input.removeEventListener('input', syncAria)
      input.removeEventListener('pointerdown', onDown)
      input.removeEventListener('pointermove', onMove)
      input.removeEventListener('pointerup', onUp)
      input.removeEventListener('pointercancel', onUp)
      input.removeEventListener('change', onChange)
      input.removeEventListener('keydown', onKey)
    })
  }

  function marquee(el) {
    cleanup(el)
    const track = el.querySelector('.flw-marquee__track')
    if (!track) return

    const measure = () => {
      track.classList.remove('flw-marquee__track--anim')
      track.style.removeProperty('--flw-marquee-dur')
      track.style.removeProperty('--flw-marquee-steps')

      // loop copy is hidden while not animating, so scrollWidth is one chunk
      const overflow = track.scrollWidth > el.clientWidth + 2
      if (overflow && !reducedMotion()) {
        const pxPerSec = 20
        const duration = Math.max(8, track.scrollWidth / pxPerSec)
        track.style.setProperty('--flw-marquee-dur', `${duration}s`)
        if (el.classList.contains('flw-marquee--stepped')) {
          const fps = Number(el.dataset.flwMarqueeFps) || 8
          track.style.setProperty('--flw-marquee-steps', String(Math.round(duration * fps)))
        }
        track.classList.add('flw-marquee__track--anim')
      }
    }

    measure()
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measure)
      : null
    if (ro) ro.observe(el)

    cleanups.set(el, () => {
      if (ro) ro.disconnect()
      track.classList.remove('flw-marquee__track--anim')
    })
  }

  const TOAST_MARKS = { ok: '●', info: '●', warn: '●', error: '○' }

  function toast(message, options) {
    const opts = options || {}
    const status = opts.status || 'ok'
    const timeout = opts.timeout === undefined ? 4000 : opts.timeout

    let root = document.querySelector('.flw-toasts')
    if (!root) {
      root = document.createElement('div')
      root.className = 'flw-toasts'
      root.setAttribute('role', 'status')
      root.setAttribute('aria-live', 'polite')
      // inside the app shell so it can lift the stack above the status bar
      ;(document.querySelector('.flw-app') || document.body).appendChild(root)
    }

    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const line = document.createElement('div')
    line.className = `flw-toast flw-toast--${status}`
    const time = document.createElement('span')
    time.className = 'flw-toast__time'
    time.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    const mark = document.createElement('span')
    mark.className = 'flw-toast__mark'
    mark.textContent = TOAST_MARKS[status] || '●'
    const text = document.createElement('span')
    text.textContent = message
    line.append(time, mark, text)

    const remove = () => line.remove()
    line.addEventListener('click', remove)
    if (timeout > 0) setTimeout(remove, timeout)

    root.appendChild(line)
    while (root.children.length > (opts.max || 5)) root.firstElementChild.remove()
    return line
  }

  // <button data-flw-open="#dialog-id"> opens a <dialog class="flw-dialog"> modally
  function opener(el) {
    cleanup(el)
    const onClick = () => {
      const target = document.querySelector(el.dataset.flwOpen)
      if (target && typeof target.showModal === 'function') target.showModal()
    }
    el.addEventListener('click', onClick)
    cleanups.set(el, () => el.removeEventListener('click', onClick))
  }

  function accordion(root) {
    const mode = root.dataset.flwAccordion || 'single'
    const items = [...root.querySelectorAll('.flw-accordion__item')]

    function setOpen(item, open) {
      const header = item.querySelector('.flw-accordion__header')
      const panel = item.querySelector('.flw-accordion__panel')
      item.classList.toggle('flw-accordion__item--open', open)
      if (header) header.setAttribute('aria-expanded', open ? 'true' : 'false')
      if (panel) panel.hidden = !open
    }

    items.forEach((item) => {
      const header = item.querySelector('.flw-accordion__header')
      const panel = item.querySelector('.flw-accordion__panel')
      if (!header || !panel) return

      const open = item.classList.contains('flw-accordion__item--open')
      header.setAttribute('aria-expanded', open ? 'true' : 'false')
      panel.hidden = !open
      if (!header.id) header.id = `flw-acc-${Math.random().toString(36).slice(2, 9)}`
      if (!panel.id) panel.id = `${header.id}-panel`
      header.setAttribute('aria-controls', panel.id)
      panel.setAttribute('role', 'region')
      panel.setAttribute('aria-labelledby', header.id)

      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('flw-accordion__item--open')
        if (mode === 'single' && !isOpen) {
          items.forEach((other) => {
            if (other !== item) setOpen(other, false)
          })
        }
        setOpen(item, !isOpen)
      })
    })
  }

  function tabs(root) {
    const tablist = root.querySelector('.flw-tabs__bar')
    const tabsEls = [...root.querySelectorAll('.flw-tabs__tab')]
    const panels = [...root.querySelectorAll('.flw-tabs__panel')]
    if (!tablist || !tabsEls.length || !panels.length) return

    tablist.setAttribute('role', 'tablist')

    function activate(index) {
      tabsEls.forEach((tab, i) => {
        const selected = i === index
        tab.setAttribute('aria-selected', selected ? 'true' : 'false')
        tab.tabIndex = selected ? 0 : -1
      })
      panels.forEach((panel, i) => {
        panel.hidden = i !== index
      })
    }

    tabsEls.forEach((tab, i) => {
      tab.setAttribute('role', 'tab')
      tab.setAttribute('tabindex', i === 0 ? '0' : '-1')
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false')
      if (!tab.id) tab.id = `flw-tab-${Math.random().toString(36).slice(2, 9)}`
      if (panels[i]) {
        panels[i].setAttribute('role', 'tabpanel')
        panels[i].setAttribute('aria-labelledby', tab.id)
        panels[i].hidden = i !== 0
      }

      tab.addEventListener('click', () => activate(i))
      tab.addEventListener('keydown', (event) => {
        let next = i
        if (event.key === 'ArrowRight') next = (i + 1) % tabsEls.length
        else if (event.key === 'ArrowLeft') next = (i - 1 + tabsEls.length) % tabsEls.length
        else if (event.key === 'Home') next = 0
        else if (event.key === 'End') next = tabsEls.length - 1
        else return
        event.preventDefault()
        activate(next)
        tabsEls[next].focus()
      })
    })
  }

  function auto(root) {
    const scope = root || document

    scope.querySelectorAll('[data-flw-spinner]').forEach(spinner)
    scope.querySelectorAll('[data-flw-marquee]').forEach(marquee)
    scope.querySelectorAll('[data-flw-range]').forEach(range)
    scope.querySelectorAll('[data-flw-scrub]').forEach(scrub)
    scope.querySelectorAll('[data-flw-accordion]').forEach(accordion)
    scope.querySelectorAll('[data-flw-tabs]').forEach(tabs)

    scope.querySelectorAll('[data-flw-open]').forEach(opener)

    scope.querySelectorAll('[data-flw-spark]').forEach((el) => {
      const values = el.dataset.flwSpark.split(/[\s,]+/).filter(Boolean).map(Number)
      spark(el, values)
    })

    scope.querySelectorAll('[data-flw-meter]').forEach((el) => {
      meter(el, Number(el.dataset.flwMeter) || 0)
    })

    scope.querySelectorAll('[data-flw-shade]').forEach((el) => {
      shade(el, Number(el.dataset.flwShade) || 0)
    })

    scope.querySelectorAll('[data-flw-bar]').forEach((el) => {
      const pct = Number(el.dataset.flwBarValue || el.getAttribute('data-flw-bar-value') || 0)
      bar(el, pct)
    })
  }

  const flw = { spinner, marquee, range, scrub, bar, shade, shadeLevel, spark, sparkline, meter, toast, accordion, tabs, auto, glyphBar, severityClass }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = flw
  }
  global.flw = flw
})(typeof globalThis !== 'undefined' ? globalThis : window)
