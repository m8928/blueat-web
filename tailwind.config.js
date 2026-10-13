/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: "#6EA8FE",
                term: {
                    bg: "#0E1013",
                    fg: "#C9D1D9",
                    bright: "#E6EDF3",
                    muted: "#8B949E",
                    dim: "#7D8590",
                    line: "#3A3F47",
                    green: "#7EE787",
                    yellow: "#F2CC60",
                    red: "#FF7B72",
                },
            },
            fontFamily: {
                mono: ['Monatendard', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
            },
        },
    },
    plugins: [],
}
