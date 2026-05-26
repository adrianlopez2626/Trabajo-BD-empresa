import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, LogOut } from 'lucide-react';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItemClass = (path) =>
        `flex items-center space-x-2 p-3 rounded-lg transition-colors ${location.pathname === path ? 'bg-primary text-white' : 'text-gray-400 hover:bg-dark-700 hover:text-white'
        }`;

    return (
        <div className="flex h-screen bg-dark-900">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col justify-between">
                <div>
                    <div className="p-6">
                        <h1 className="text-2xl font-bold font-sans text-white tracking-wider flexItems-center gap-2">
                            <span className="text-primary">TECH</span>INCIDENTS
                        </h1>
                    </div>
                    <nav className="space-y-2 px-4 mt-8">
                        <Link to="/" className={navItemClass('/')}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/incidents" className={navItemClass('/incidents')}>
                            <AlertCircle size={20} />
                            <span>Incidencias</span>
                        </Link>
                    </nav>
                </div>
                <div className="p-4 border-t border-dark-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-gray-400 hover:text-danger p-2 w-full transition-colors rounded-lg hover:bg-dark-700"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-900 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
