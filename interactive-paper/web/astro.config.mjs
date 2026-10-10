import { defineConfig } from 'astro/config';

export default defineConfig({
  // Statische Seite: Astro erzeugt fertige HTML-Dateien, JavaScript nur dort, wo wir es brauchen.
  devToolbar: { enabled: false },
});
