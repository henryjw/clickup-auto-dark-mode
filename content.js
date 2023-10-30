/**
 * @typedef {Object} ClickUpUserResponse
 * @property {Object} user
 * @property {boolean} user.dark_theme
 */

const USER_URL = `${window.location.origin}/user/v1/user`;

async function handleSystemThemeChange(event) {
    const systemDarkModeEnabled = Boolean(event.matches)
    const appDarkModeEnabled = await darkModeEnabled()

    if (systemDarkModeEnabled === appDarkModeEnabled) {
        return
    }

    await setDarkMode(systemDarkModeEnabled)
}

/**
 *
 * @param {boolean} enabled
 * @returns {Promise<void>}
 */
async function setDarkMode(enabled) {
    try {
        const res = await fetch(USER_URL, {
            method: 'PUT',
            body: JSON.stringify({
                dark_theme: enabled
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })

        if (res.status !== 200) {
            throw new Error(`Expected 200, got ${res.status}`)
        }

        if (res.type === 'cors') {
            return
        }

        /**
         * @type {ClickUpUserResponse}
         */
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

/**
 * @returns {Promise<boolean>}
 */
async function darkModeEnabled() {
    try {
        const res = await fetch(USER_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            }
        })

        /**
         * @type {ClickUpUserResponse}
         */
        const data = await res.json()

        return data?.user?.dark_theme
    } catch(err) {
        console.error('Error getting dark mode status', err)
    }
}

function getAuthToken() {
    return localStorage.getItem('id_token')
}


(async () => {
    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // Initial check for the system theme
    await handleSystemThemeChange(systemThemeQuery)

    // Listen for changes to the system theme
    systemThemeQuery.addEventListener('change', handleSystemThemeChange)
})();
