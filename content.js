function handleSystemThemeChange(event) {
    const darkModeEnabled = event.matches
    
    setDarkMode(darkModeEnabled)
}

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

// Listen for changes to the system theme
systemThemeQuery.addEventListener('change', handleSystemThemeChange)

/**
 * 
 * @param {boolean} enabled 
 * @returns {Promise<void>}
 */
async function setDarkMode(enabled) {
    const authToken = localStorage.getItem('id_token')
    try {
        const res = await fetch('https://app.clickup.com/user/v1/user', {
            method: 'PUT',
            body: JSON.stringify({
                dark_theme: enabled
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        })

        if (res.status !== 200) {
            throw new Error('Expected 200')
        }

        if (res.type === 'cors') {
            return
        }

        const data = await res.json()

        if (data?.user?.dark_theme !== enabled) {
            // TODO: display these errors to the end user using some kind of toast notification
            console.warn('Dark mode wasn\'t updated. This is possibly due to a change in the ClickUp API. Please contact the maintainer of this extension.')
            return
        }

        console.log('Dark mode was successully enabled')

        location.reload()
    } catch (err) {
        console.error('Error setting dark mode', err)
    }
}