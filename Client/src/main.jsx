import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import { Provider } from 'react-redux'
import { store } from './app/store.js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CallProvider } from './context/CallContext.jsx'
import { HelmetProvider } from 'react-helmet-async'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Clerk publishable key')
}

createRoot(document.getElementById('root')).render(
    <HelmetProvider>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Provider store={store}>
                        <CallProvider>
                            <App />
                        </CallProvider>
                    </Provider>
                </BrowserRouter>
            </QueryClientProvider>
        </ClerkProvider>
    </HelmetProvider>
)
