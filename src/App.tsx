import { useState } from 'react';
import type { SubmitEvent } from 'react';
import UserList from "./UserList.tsx";

function App() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    // Práctica 8: Recuperar el token guardado en localStorage al iniciar la app
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

    async function handleSubmit(ev: SubmitEvent<HTMLFormElement>) {
        ev.preventDefault();
        setError(null); // Limpiamos errores anteriores antes de intentar

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            // await para procesar el JSON
            const data = await response.json(); 

            if (!response.ok) {
                // Si el backend devuelve un string o un mensaje alternativo
                setError(data.detail || 'Ocurrió un error al iniciar sesión');
                return;
            }

            // Práctica 8: Persistir el token en localStorage para mantener sesión activa
            localStorage.setItem('token', data.token);
            setToken(data.token);
            console.log("Login exitoso, token guardado:", data.token);

        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error(err);
        }
    }

    // Práctica 8: Función que borra el token de localStorage y del estado, y vuelve al login con mensaje
    function handleUnauthorized() {
        localStorage.removeItem('token');
        setToken(null);
        setError('Tu sesión venció');
    }

    if(token) {
      // Práctica 8: Pasar handleUnauthorized como prop onUnauthorized a UserList
      return <UserList token={token} onUnauthorized={handleUnauthorized}/>;
      
    }


    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {token && <p style={{ color: 'green' }}>¡Logueado con éxito!</p>}
                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}

export default App;

