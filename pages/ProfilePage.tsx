import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../supabase/client';

const ProfilePage: React.FC = () => {
    const { profile, loading, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setFirstName(profile.first_name || '');
            setLastName(profile.last_name || '');
            setCity(profile.city || '');
            setPhone(profile.phone || '');
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: firstName,
                    last_name: lastName,
                    city: city,
                    phone: phone,
                    updated_at: new Date()
                })
                .eq('id', profile?.id);

            if (error) throw error;

            await refreshProfile();
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error al actualizar el perfil.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="text-white pt-32 text-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 pb-20">
            <SEO title="Mis Datos - Savage Store" description="Gestiona tu información personal." />

            <div className="max-w-3xl mx-auto">
                <header className="mb-12 border-b border-white/10 pb-8 flex flex-col gap-4">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors w-fit">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al inicio
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2">Mis Datos</h1>
                        <p className="text-gray-500">Actualiza tu información de contacto y envío.</p>
                    </div>
                </header>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
                    {message && (
                        <div className={`p-4 rounded-lg mb-6 text-sm font-bold uppercase tracking-wide text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Nombre</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Apellido</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Ciudad</label>
                            <input
                                type="text"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Celular</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-primary text-black font-black uppercase tracking-widest py-3 px-8 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
