import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
            <div className="max-w-md w-full bg-dark-800 rounded-2xl shadow-xl overflow-hidden border border-dark-700">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
                            <span className="text-primary">TECH</span>INCIDENTS
                        </h1>
                        <p className="text-gray-400">Panel de Administración</p>
                    </div>

                    {error && (
                        <div className="bg-danger/20 border border-danger/50 text-danger p-3 rounded-lg mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="admin@empresa.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-dark-900 border border-dark-700 text-white rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-primary/20"
                        >
                            Entrar al Sistema
                        </button>
                    </form>
                    <div className="mt-6 text-center text-gray-500 text-sm">
                        <p>Demo Admin: admin@empresa.com / admin123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
