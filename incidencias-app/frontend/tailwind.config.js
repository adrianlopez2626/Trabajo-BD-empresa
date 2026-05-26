export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#121212',
                    800: '#1E1E1E',
                    700: '#2D2D2D',
                    600: '#3D3D3D',
                },
                primary: '#3B82F6',   // blue-500
                secondary: '#10B981', // emerald-500
                danger: '#EF4444',    // red-500
                warning: '#F59E0B',   // amber-500
            }
        },
    },
    plugins: [],
}
