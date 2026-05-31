const THEME_STORAGE_KEY = "darkMode";
const DARK_MODE_ICON_PATH = "../res/mode-dark.svg";
const LIGHT_MODE_ICON_PATH = "../res/mode-light.svg";
const GITHUB_DARK_ICON_PATH = "../res/github-dark.svg";
const GITHUB_LIGHT_ICON_PATH = "../res/github-light.svg";

function updateThemeIcons(isDarkMode) {
  const modeIcon = document.getElementById("mode-icon");
  const githubIcon = document.getElementById("github-icon");

  if (modeIcon) {
    modeIcon.src = isDarkMode ? DARK_MODE_ICON_PATH : LIGHT_MODE_ICON_PATH;
  }

  if (githubIcon) {
    githubIcon.src = isDarkMode ? GITHUB_DARK_ICON_PATH : GITHUB_LIGHT_ICON_PATH;
  }
}

function applyTheme(isDarkMode) {
  document.body.classList.toggle("dark-mode", isDarkMode);
  document.body.classList.toggle("light-mode", !isDarkMode);
  localStorage.setItem(THEME_STORAGE_KEY, String(isDarkMode));
  updateThemeIcons(isDarkMode);
}

export function initializeTheme() {
  const storedMode = localStorage.getItem(THEME_STORAGE_KEY);
  const isDarkMode = storedMode === null ? true : storedMode === "true";
  const modeToggle = document.getElementById("mode-toggle-checkbox");

  if (!modeToggle) {
    return;
  }

  modeToggle.checked = isDarkMode;
  applyTheme(isDarkMode);

  modeToggle.addEventListener("change", () => {
    applyTheme(modeToggle.checked);
  });
}
