import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="bg-[hsl(var(--navbar-bg))] hover:opacity-80 w-14 h-14 flex items-center justify-center relative cursor-pointer"
    >
      <Sun className="h-[1.5rem] w-[1.5rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.5rem] w-[1.5rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
