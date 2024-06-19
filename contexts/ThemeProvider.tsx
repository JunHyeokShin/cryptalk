import { ThemeProvider } from "next-themes"

type Props = {
  children: React.ReactNode
}

export default function ThemeContext({ children }: Props) {
  return <ThemeProvider attribute="class">{children}</ThemeProvider>
}
