import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { setupIonicReact } from '@ionic/react'
import { store } from './store'
import { getCurrentUserFromToken } from './utils/jwt'
import { setCredentials } from './store/slices/authSlice'
import { StorageEngine } from './services/localStorage/storageEngine'
import App from './App'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

import './index.css'

setupIonicReact({
  mode: 'md',
})

// Initialize localStorage engine with seed data if needed
StorageEngine.init()

const accessToken = localStorage.getItem('accessToken')
const refreshToken = localStorage.getItem('refreshToken')

if (accessToken && refreshToken) {
  const user = getCurrentUserFromToken(accessToken)
  if (user) {
    store.dispatch(setCredentials({ user, accessToken, refreshToken }))
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
