/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom Fieldsy Colors
        'table-header': '#575757',
        'table-text': '#20130B',
        'green': '#3A6B22',            // Primary green
        'light-green': '#8FB366',      // Pastel green
        'dark-green': '#192215',       // Dark green
        'cream': '#F8F1D7',    
        'cream-hover': '#efe5bf',      // Hover state for cream
        'light': '#FFFCF3',            // Light yellow/cream
        'light-cream': '#FFFCF3',      // Very light background
        'yellow': '#FFBD00',           // Dark yellow/gold
        'ash': '#EBEBEB',
        
        // Additional colors found in codebase
        'gray-text': '#8D8D8D',        // Gray text
        'gray-dark': '#6B737D',        // Dark gray text
        'gray-border': '#e3e3e3',      // Gray border
        'gray-light': '#F8F9FA',       // Light gray background
        'gray-lighter': '#f7f7f7',     // Lighter gray background
        'gray-lightest': '#F0F0F0',    // Lightest gray
        'gray-input': '#434141',       // STANDARD INPUT TEXT COLOR
        'placeholder-gray': '#999a9b', // Standard placeholder color
        'green-hover': '#2d5319',      // Dark green hover
        'green-darker': '#2D5A1B',     // Even darker green
        'green-light': '#8ad04d',      // Light green (card)
        'green-lighter': '#E8F5E1',    // Very light green
        'blue-dark': '#0A2533',        // Dark blue text
        'red': '#e31c20',              // Red for errors/delete
          
        // Pastel backgrounds
        'bg-faq': '#FAF7F2',           // FAQ section background
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
        slideDown: 'slideDown 0.2s ease-out',
        messageSlide: 'messageSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        messageSlide: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px) scale(0.95)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
        },
      },
    },
  },
  plugins: [],
}