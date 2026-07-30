/* Config di build per Tailwind CSS — genera css/tailwind.css a partire da index.html
   e index-nuovi-loghi.html (versione alternativa con i loghi ufficiali).
   Rilancia con: npx tailwindcss -i tailwind-input.css -o css/tailwind.css -c tailwind.config.js --minify
   ogni volta che cambiano le classi usate in uno dei due file. */
module.exports = {
  content: ["./index.html", "./index-nuovi-loghi.html"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#25543A', dark: '#193A28', light: '#3A7A54' },
        accent:  { DEFAULT: '#D6A138', dark: '#B9852A', light: '#E8C173' },
        ink: '#1A1A18',
        cream: { DEFAULT: '#F7F3EA', alt: '#EFE8D6' },
      },
      fontFamily: {
        serif: ['Lora', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: { container: '1200px' },
      boxShadow: { soft: '0 20px 60px -20px rgba(26,26,24,0.25)' },
    }
  }
};
