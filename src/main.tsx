import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "@/components/layers/theme-provider.tsx"
import { BrowserRouter } from 'react-router'
import './i18n';
import { TooltipProvider } from "@/components/ui/tooltip"


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="hsr-build-calculator-theme">
      <BrowserRouter>
<TooltipProvider>
        <App />
</TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)