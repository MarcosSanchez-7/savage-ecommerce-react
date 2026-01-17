import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signInWithEmail, signUpWithEmail } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signInWithEmail(email, password);
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await signUpWithEmail(email, password);
                if (error) throw error;
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 pt-20">
            <SEO title={isLogin ? "Iniciar Sesión" : "Crear Cuenta"} description="Accede a tu cuenta Savage." />

            <div className="w-full max-w-md p-8 border border-white/10 rounded-2xl bg-[#0a0a0a]">
                <h1 className="text-3xl font-black mb-2 tracking-wider text-center">
                    {isLogin ? 'BIENVENIDO' : 'ÚNETE A SAVAGE'}
                </h1>
                <p className="text-gray-500 text-center mb-8 text-sm">
                    {isLogin ? 'Ingresa a tu cuenta para continuar' : 'Crea tu cuenta y accede a beneficios exclusivos'}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 mt-4"
                    >
                        {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-gray-500 text-xs uppercase tracking-widest hover:text-white transition-colors"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
