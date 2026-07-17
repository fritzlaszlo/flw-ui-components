/**
 * flw — optional JS helpers for terminal-style UI widgets.
 * Framework-agnostic; CSS works without this file.
 */
(function (global) {
  'use strict'

  const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  const SPINNER_INTERVAL = 80

  const cleanups = new WeakMap()

  function severityClass(pct) {
    if (pct > 90) return 'flw-progress__bar--red'
    if (pct > 70) return 'flw-progress__bar--orange'
    return 'flw-progress__bar--green'
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
    const charEl = el.matches('[data-flw-spinner]')
      ? el
      : el.querySelector('.flw-spinner__char')
    if (!charEl) return

    let index = 0
    charEl.textContent = SPINNER_FRAMES[0]
    const id = setInterval(() => {
      index = (index + 1) % SPINNER_FRAMES.length
      charEl.textContent = SPINNER_FRAMES[index]
    }, SPINNER_INTERVAL)

    cleanups.set(el, () => clearInterval(id))
  }

  function bar(el, pct, options) {
    const opts = options || {}
    const width = opts.width || Number(el.dataset.flwBarWidth) || 20
    const showValue = opts.showValue !== false
    const clamped = Math.min(100, Math.max(0, pct))

    const barEl = el.querySelector('.flw-progress__bar') || el
    barEl.textContent = glyphBar(clamped, width)
    barEl.classList.remove(
      'flw-progress__bar--green',
      'flw-progress__bar--orange',
      'flw-progress__bar--red'
    )
    barEl.classList.add(severityClass(clamped))

    if (showValue) {
      const valueEl = el.querySelector('.flw-progress__value')
      if (valueEl) valueEl.textContent = `${Math.round(clamped)}%`
    }
  }

  function marquee(el) {
    cleanup(el)
    const track = el.querySelector('.flw-marquee__track')
    if (!track) return

    const measure = () => {
      track.classList.remove('flw-marquee__track--anim')
      track.style.removeProperty('--flw-marquee-dur')

      const overflow = track.scrollWidth > el.clientWidth + 2
      if (overflow) {
        const pxPerSec = 40
        const duration = Math.max(8, track.scrollWidth / pxPerSec)
        track.style.setProperty('--flw-marquee-dur', `${duration}s`)
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
    scope.querySelectorAll('[data-flw-accordion]').forEach(accordion)
    scope.querySelectorAll('[data-flw-tabs]').forEach(tabs)

    scope.querySelectorAll('[data-flw-bar]').forEach((el) => {
      const pct = Number(el.dataset.flwBarValue || el.getAttribute('data-flw-bar-value') || 0)
      bar(el, pct)
    })
  }

  const flw = { spinner, marquee, bar, accordion, tabs, auto, glyphBar, severityClass }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = flw
  }
  global.flw = flw
})(typeof globalThis !== 'undefined' ? globalThis : window)
