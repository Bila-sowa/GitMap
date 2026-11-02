const THEME_STATES = ['system', 'dark-theme', 'light-theme']
const DEFAULT_THEME = 'system'

const isThemeState = (value) => {
  return THEME_STATES.includes(value)
}

const normalizeTheme = (value) => {
  return isThemeState(value) ? value : DEFAULT_THEME
}

export { THEME_STATES, DEFAULT_THEME, isThemeState, normalizeTheme }
