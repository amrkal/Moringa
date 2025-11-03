import type { Config } from "tailwindcss";

const config: any = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundColor: {
        'primary-soft': 'hsl(var(--primary) / 0.12)',
        'success-soft': 'hsl(var(--success) / 0.12)',
        'warning-soft': 'hsl(var(--warning) / 0.12)',
        'destructive-soft': 'hsl(var(--destructive) / 0.12)',
        'info-soft': 'hsl(var(--info) / 0.12)',
      },
      backdropBlur: {
        'xl': '20px',
      },
    },
  },
  darkMode: 'class',
  safelist: [
    // Primary colors
    'bg-primary',
    'text-primary',
    'border-primary',
    'ring-primary',
    'bg-primary-soft',
    // Success colors
    'bg-success',
    'text-success',
    'bg-success-soft',
    // Warning colors
    'bg-warning',
    'text-warning',
    'bg-warning-soft',
    // Destructive colors
    'bg-destructive',
    'text-destructive',
    'bg-destructive-soft',
    // Info colors
    'bg-info',
    'text-info',
    'bg-info-soft',
    // Hover states
    'hover:bg-primary-soft',
    'hover:bg-success-soft',
    'hover:bg-warning-soft',
    'hover:bg-destructive-soft',
    'hover:bg-info-soft',
  ],
  plugins: [],
};

export default config;