import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { Link } from "react-router-dom"
import { gsap } from "gsap"
import "./StaggeredMenu.css"

export const StaggeredMenu = ({
  position = "right",
  colors = ["#B19EEF", "#5227FF"],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl = "/src/assets/logos/reactbits-gh-white.svg",
  menuButtonColor = "#fff",
  openMenuButtonColor = "#fff",
  accentColor = "#5227FF",
  changeMenuColorOnOpen = true,
  isFixed = false,
  onMenuOpen,
  onMenuClose,
}) => {
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const panelRef = useRef(null)
  const preLayersRef = useRef(null)
  const preLayerElsRef = useRef([])
  const plusHRef = useRef(null)
  const plusVRef = useRef(null)
  const iconRef = useRef(null)
  const textInnerRef = useRef(null)
  const textWrapRef = useRef(null)
  const [textLines, setTextLines] = useState(["Menu", "Close"])
  const openTlRef = useRef(null)
  const closeTweenRef = useRef(null)
  const spinTweenRef = useRef(null)
  const textCycleAnimRef = useRef(null)
  const colorTweenRef = useRef(null)
  const toggleBtnRef = useRef(null)
  const busyRef = useRef(false)
  const itemEntranceTweenRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current
      const preContainer = preLayersRef.current
      const plusH = plusHRef.current
      const plusV = plusVRef.current
      const icon = iconRef.current
      const textInner = textInnerRef.current

      if (!panel || !plusH || !plusV || !icon || !textInner) return

      let preLayers = []
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll(".sm-prelayer"))
      }
      preLayerElsRef.current = preLayers

      const offscreen = position === "left" ? -100 : 100
      gsap.set([panel, ...preLayers], { xPercent: offscreen })
      gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 })
      gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 })
      gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" })
      gsap.set(textInner, { yPercent: 0 })

      if (toggleBtnRef.current)
        gsap.set(toggleBtnRef.current, { color: menuButtonColor })
    })

    return () => ctx.revert()
  }, [menuButtonColor, position])

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return null

    openTlRef.current?.kill()
    if (closeTweenRef.current) {
      closeTweenRef.current.kill()
      closeTweenRef.current = null
    }
    itemEntranceTweenRef.current?.kill()

    const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel"))
    const numberEls = Array.from(
      panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")
    )
    const socialTitle = panel.querySelector(".sm-socials-title")
    const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link"))

    const layerStates = layers.map((el) => ({
      el,
      start: Number(gsap.getProperty(el, "xPercent")),
    }))
    const panelStart = Number(gsap.getProperty(panel, "xPercent"))

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 })
    }
    if (numberEls.length) {
      gsap.set(numberEls, { "--sm-num-opacity": 0 })
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 })
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 })
    }

    const tl = gsap.timeline({ paused: true })

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07
      )
    })

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0)
    const panelDuration = 0.65

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime
    )

    if (itemEls.length) {
      const itemsStartRatio = 0.15
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio

      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          stagger: { each: 0.1, from: "start" },
        },
        itemsStart
      )

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            "--sm-num-opacity": 1,
            stagger: { each: 0.08, from: "start" },
          },
          itemsStart + 0.1
        )
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          socialsStart
        )
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: { each: 0.08, from: "start" },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: "opacity" })
            },
          },
          socialsStart + 0.04
        )
      }
    }

    openTlRef.current = tl
    return tl
  }, [])

  const playOpen = useCallback(() => {
    if (busyRef.current) return
    busyRef.current = true
    const tl = buildOpenTimeline()
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false
      })
      tl.play(0)
    } else {
      busyRef.current = false
    }
  }, [buildOpenTimeline])

  const playClose = useCallback(() => {
    openTlRef.current?.kill()
    openTlRef.current = null
    itemEntranceTweenRef.current?.kill()

    const panel = panelRef.current
    const layers = preLayerElsRef.current
    if (!panel) return

    const all = [...layers, panel]
    closeTweenRef.current?.kill()
    const offscreen = position === "left" ? -100 : 100

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls = Array.from(
          panel.querySelectorAll(".sm-panel-itemLabel")
        )
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 })
        }
        const numberEls = Array.from(
          panel.querySelectorAll(
            ".sm-panel-list[data-numbering] .sm-panel-item"
          )
        )
        if (numberEls.length) {
          gsap.set(numberEls, { "--sm-num-opacity": 0 })
        }
        const socialTitle = panel.querySelector(".sm-socials-title")
        const socialLinks = Array.from(
          panel.querySelectorAll(".sm-socials-link")
        )
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 })
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 })
        busyRef.current = false
      },
    })
  }, [position])

  const animateIcon = useCallback((opening) => {
    const icon = iconRef.current
    if (!icon) return
    spinTweenRef.current?.kill()
    if (opening) {
      spinTweenRef.current = gsap.to(icon, {
        rotate: 225,
        duration: 0.8,
        ease: "power4.out",
        overwrite: "auto",
      })
    } else {
      spinTweenRef.current = gsap.to(icon, {
        rotate: 0,
        duration: 0.35,
        ease: "power3.inOut",
        overwrite: "auto",
      })
    }
  }, [])

  const animateColor = useCallback(
    (opening) => {
      const btn = toggleBtnRef.current
      if (!btn) return
      colorTweenRef.current?.kill()
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.18,
          duration: 0.3,
          ease: "power2.out",
        })
      } else {
        gsap.set(btn, { color: menuButtonColor })
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  )

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current
          ? openMenuButtonColor
          : menuButtonColor
        gsap.set(toggleBtnRef.current, { color: targetColor })
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor })
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor])

  const animateText = useCallback((opening) => {
    const inner = textInnerRef.current
    if (!inner) return
    textCycleAnimRef.current?.kill()
    const currentLabel = opening ? "Menu" : "Close"
    const targetLabel = opening ? "Close" : "Menu"
    const cycles = 3
    const seq = [currentLabel]
    let last = currentLabel
    for (let i = 0; i < cycles; i++) {
      last = last === "Menu" ? "Close" : "Menu"
      seq.push(last)
    }
    if (last !== targetLabel) seq.push(targetLabel)
    seq.push(targetLabel)
    setTextLines(seq)
    gsap.set(inner, { yPercent: 0 })
    const lineCount = seq.length
    const finalShift = ((lineCount - 1) / lineCount) * 100
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: "power4.out",
    })
  }, [])

  const toggleMenu = useCallback(() => {
    const target = !openRef.current
    openRef.current = target
    setOpen(target)
    if (target) {
      onMenuOpen?.()
      playOpen()
    } else {
      onMenuClose?.()
      playClose()
    }
    animateIcon(target)
    animateColor(target)
    animateText(target)
  }, [
    playOpen,
    playClose,
    animateIcon,
    animateColor,
    animateText,
    onMenuOpen,
    onMenuClose,
  ])

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    // Se il menu non è aperto, non aggiungere il listener
    if (!open) return

    const handleClickOutside = (event) => {
      // Controlla se il click è sul menu (panel) o sul pulsante toggle
      const panel = panelRef.current
      const toggleBtn = toggleBtnRef.current

      if (panel && toggleBtn) {
        const isClickOnPanel = panel.contains(event.target)
        const isClickOnToggle = toggleBtn.contains(event.target)

        // Se il click è fuori sia dal panel che dal toggle, chiudi il menu
        if (!isClickOnPanel && !isClickOnToggle) {
          toggleMenu()
        }
      }
    }

    // Aggiungi il listener quando il menu è aperto
    // Usa un piccolo delay per evitare che il click che apre il menu lo chiuda immediatamente
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, toggleMenu])

  return (
    <div
      className={
        (className ? className + " " : "") +
        "staggered-menu-wrapper" +
        (isFixed ? " fixed-wrapper" : "")
      }
      style={accentColor ? { ["--sm-accent"]: accentColor } : undefined}
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw =
            colors && colors.length
              ? colors.slice(0, 4)
              : ["#1e1e22", "#35353c"]
          let arr = [...raw]
          if (arr.length >= 3) {
            const mid = Math.floor(arr.length / 2)
            arr.splice(mid, 1)
          }
          return arr.map((c, i) => (
            <div key={i} className="sm-prelayer" style={{ background: c }} />
          ))
        })()}
      </div>

      <header
        className="staggered-menu-header"
        aria-label="Main navigation header"
      >
        <div className="sm-logo" aria-label="Logo">
          {logoUrl ? (
            <Link
              to="/"
              className="sm-logo-with-text"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <img
                src={logoUrl}
                alt="ScoreBTW Logo"
                className="sm-logo-img"
                draggable={false}
                height={44}
                style={{ width: "auto" }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.55rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "inherit",
                  }}
                >
                  ScoreBTW
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    borderRadius: "999px",
                    padding: "0.14rem 0.55rem",
                    color: "rgba(214, 228, 255, 0.75)",
                  }}
                >
                  beta
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/" className="sm-logo-custom">
              <span
                style={{
                  width: "44px",
                  height: "44px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(0, 236, 255, 0.35), rgba(38, 111, 255, 0.55))",
                  fontSize: "1.35rem",
                  boxShadow: "0 16px 28px rgba(0, 132, 255, 0.35)",
                }}
              >
                🎮
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.55rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "inherit",
                  }}
                >
                  ScoreBTW
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    borderRadius: "999px",
                    padding: "0.14rem 0.55rem",
                    color: "rgba(214, 228, 255, 0.75)",
                  }}
                >
                  beta
                </span>
              </div>
            </Link>
          )}
        </div>
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          onClick={toggleMenu}
          type="button"
        >
          <span
            ref={textWrapRef}
            className="sm-toggle-textWrap"
            aria-hidden="true"
          >
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((l, i) => (
                <span className="sm-toggle-line" key={i}>
                  {l}
                </span>
              ))}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
      >
        <div className="sm-panel-inner">
          <ul
            className="sm-panel-list"
            role="list"
            data-numbering={displayItemNumbering || undefined}
          >
            {items && items.length ? (
              items.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  {it.onClick ? (
                    <button
                      className="sm-panel-item"
                      onClick={(e) => {
                        e.preventDefault()
                        it.onClick()
                      }}
                      aria-label={it.ariaLabel}
                      data-index={idx + 1}
                    >
                      <span className="sm-panel-itemLabel">{it.label}</span>
                    </button>
                  ) : it.component === Link ? (
                    <Link
                      className="sm-panel-item"
                      to={it.to || it.link || "#"}
                      aria-label={it.ariaLabel}
                      data-index={idx + 1}
                      onClick={(e) => {
                        if (it.onClick) {
                          e.preventDefault()
                          it.onClick()
                        } else {
                          // Chiudi il menu quando si clicca su un link
                          if (open) {
                            toggleMenu()
                          }
                        }
                      }}
                    >
                      <span className="sm-panel-itemLabel">{it.label}</span>
                    </Link>
                  ) : (
                    <a
                      className="sm-panel-item"
                      href={it.link || "#"}
                      aria-label={it.ariaLabel}
                      data-index={idx + 1}
                    >
                      <span className="sm-panel-itemLabel">{it.label}</span>
                    </a>
                  )}
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>

          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i} className="sm-socials-item">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

export default StaggeredMenu
