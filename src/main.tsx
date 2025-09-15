import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { MessageProvider } from './contexts/MessageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <MessageProvider>
          <App />
        </MessageProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
