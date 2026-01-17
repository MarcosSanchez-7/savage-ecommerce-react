import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);

    // Login Fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register Fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const { signInWithEmail, signUpWithEmail, session } = useAuth(); // Get session
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (session) {
            navigate('/');
        }
    }, [session, navigate]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Safety reset
    React.useEffect(() => {
        setLoading(false);
    }, []);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signInWithEmail(email, password);
                if (error) throw error;
                // Since state update is async, we can't trust isAdmin immediately here without a refresh,
                // but AuthContext updates state on login.
                // A simple reload or redirect to home is safer, letting the context settle.
                // However, let's try to be smart.
                navigate('/');
            } else {
                // Register Validations
                if (password !== confirmPassword) {
                    throw new Error("Las contraseñas no coinciden.");
                }
                if (password.length < 6) {
                    throw new Error("La contraseña debe tener al menos 6 caracteres.");
                }

                const { error } = await signUpWithEmail(email, password, {
                    first_name: firstName,
                    last_name: lastName,
                    city: city,
                    phone: phone
                });

                if (error) throw error;

                setSuccessMessage("¡Cuenta creada con éxito! Bienvenido a Savage.");
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes('Password should be at least')) {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else if (err.message && err.message.includes('User already registered')) {
                setSuccessMessage('Cuenta ya existente. Redirigiendo al Login...');
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccessMessage(null);
                    setError(null);
                }, 1500);
            } else {
                setError(err.message || 'Ocurrió un error. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setSuccessMessage(null);
        // Reset fields when switching? optional.
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 pt-20">
            <SEO title={isLogin ? "Iniciar Sesión" : "Crear Cuenta"} description="Accede a tu cuenta Savage." />

            <div className="w-full max-w-md p-8 border border-white/10 rounded-xl bg-[#0a0a0a] shadow-2xl">
                <h1 className="text-3xl font-black mb-2 tracking-wider text-center uppercase">
                    {isLogin ? 'Bienvenido' : 'Únete a Savage'}
                </h1>
                <p className="text-gray-500 text-center mb-8 text-xs uppercase tracking-widest">
                    {isLogin ? 'Ingresa a tu cuenta para continuar' : 'Crea tu cuenta y accede a beneficios exclusivos'}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-bold mb-6 text-center uppercase tracking-wide">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg text-xs font-bold mb-6 text-center uppercase tracking-wide">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Nombre</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Juan"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Apellido</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Pérez"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Ciudad</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                    placeholder="Asunción"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Celular</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                    placeholder="0981..."
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                            placeholder="tu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pr-10 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Confirmar Contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <p className="text-[9px] text-gray-400 mt-2 flex gap-1 items-center">
                                <span className="material-symbols-outlined text-[10px]">info</span>
                                Usa números y símbolos para mayor seguridad.
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 mt-4 shadow-lg shadow-primary/20"
                    >
                        {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <button
                        onClick={toggleMode}
                        className="text-gray-500 text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                    >
                        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                        <span className="text-primary font-bold underline decoration-primary/30 underline-offset-4 hover:decoration-primary/100 transition-all">
                            {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
