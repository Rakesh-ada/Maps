import * as WebBrowser from 'expo-web-browser'
import React from 'react'

export const useWarmUpBrowser = () => {
    React.useEffect(() => {
        // Warm up the android browser to improve UX
        // https://docs.expo.dev/guides/authentication/#improving-user-experience
        void WebBrowser.warmUpAsync().catch((err) => {
            console.warn('Warm up failed:', err.message)
        })
        return () => {
            void WebBrowser.coolDownAsync().catch(() => { })
        }
    }, [])
}
