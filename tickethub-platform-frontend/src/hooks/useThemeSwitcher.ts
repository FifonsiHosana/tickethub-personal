import { useEffect, useState } from "react"
import { useTheme } from "@/components/shared/Theme/ThemeProvider"

export function useIsDark() {
  const { theme } = useTheme()
  const [systemDark, setSystemDark] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSystemDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return theme === "dark" || (theme === "system" && systemDark)
}