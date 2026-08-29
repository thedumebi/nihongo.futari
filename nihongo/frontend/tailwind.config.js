export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        hover: 'var(--color-hover)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        bg: 'var(--color-bg)',
        card: 'var(--color-card)',
        line: 'var(--color-border)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        cloud: 'var(--color-cloud)',
        washi: 'var(--color-washi)',
        ink: 'var(--color-ink)',
        heading: 'var(--color-heading)',
        doodle: 'var(--color-doodle)',
        toggle: 'var(--color-toggle)'
      },
      borderColor: {
        DEFAULT: 'var(--color-border)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Alice', 'Georgia', 'serif'],
        display: ['Alice', 'Georgia', 'serif'],
        marker: ['Chewy', 'Comic Sans MS', 'cursive']
      }
    }
  },
  plugins: []
}
