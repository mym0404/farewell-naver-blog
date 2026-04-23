import { useEffect } from "react"

export const useBrandMarkScroll = () => {
  useEffect(() => {
    const root = document.documentElement
    let frameId = 0

    const updateBrandMarkScale = () => {
      frameId = 0

      const scrollRange = Math.max(window.innerHeight * 0.75, 320)
      const progress = Math.min(window.scrollY / scrollRange, 1)
      const nextScale = 1.04 - progress * 0.12

      root.style.setProperty("--brand-mark-scroll-scale", nextScale.toFixed(3))
    }

    const requestScaleUpdate = () => {
      if (frameId !== 0) {
        return
      }

      frameId = window.requestAnimationFrame(updateBrandMarkScale)
    }

    requestScaleUpdate()
    window.addEventListener("scroll", requestScaleUpdate, { passive: true })
    window.addEventListener("resize", requestScaleUpdate)

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }

      window.removeEventListener("scroll", requestScaleUpdate)
      window.removeEventListener("resize", requestScaleUpdate)
      root.style.removeProperty("--brand-mark-scroll-scale")
    }
  }, [])
}
