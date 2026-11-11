import { useState } from 'react';
import type { SubmitEvent } from 'react';
import UserList from "./UserList.tsx";

function App() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    async function handleSubmit(ev: SubmitEvent) {
        ev?.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            
            const data = await response.json(); 

            if (!response.ok) {
                setError(data.detail || 'Ocurrió un error al iniciar sesión');
                return;
            }

            setToken(data.token);

        } catch (err) {
            setError('Error de conexión con el servidor');
        }
    }

    if(token) {
      return <UserList token={token} />;
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

