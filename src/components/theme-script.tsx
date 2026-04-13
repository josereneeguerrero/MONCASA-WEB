export default function ThemeScript() {
  const themeScript = `
    (function() {
      const storageKey = 'moncasa-theme';
      
      function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      function resolveTheme(preference) {
        if (preference === 'system') {
          return getSystemTheme();
        }
        return preference;
      }
      
      function applyTheme(preference) {
        const theme = resolveTheme(preference);
        document.documentElement.dataset.theme = theme;
      }
      
      // Obtener preferencia guardada o usar sistema
      const stored = localStorage.getItem(storageKey);
      const preference = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
      
      // Aplicar inmediatamente
      applyTheme(preference);
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
