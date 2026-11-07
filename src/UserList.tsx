import { useState, useEffect } from 'react';
import type { SubmitEvent } from 'react';

interface User {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface Country {
    id: number;
    name: string;
}

interface UserDetail {
    id: number;
    name: string;
    email: string;
    age: number;
    country: Country | null;
    roles: Role[];
}

// Recibes el token como una prop del componente
function UserList({ token }: { token: string }) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detail, setDetail] = useState<UserDetail | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState<string>('');

    const [currentUser, setCurrentUser] = useState<UserDetail | null>(null);

    // Función reutilizable para cargar la lista completa
    async function loadUsers() {
        setLoading(true);
        setError(null);

        try {
            const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                setError(data.detail || 'Ocurrió un error al obtener la lista de Usuarios');
                return;
            }
            
            setUsers(data);

            } catch (ex) {
                setError('Error de conexión con el servidor');
                console.error(ex);

            } finally {
                setLoading(false);
            }
        }

    // Efecto inicial: cargar todos los usuarios al montar o cambiar token
    useEffect(() => {
        loadUsers();
    }, [token]);

    // Práctica 1: useEffect que depende del id seleccionado para consultar GET /user/{id}
    useEffect(() => {
        if (selectedId === null) {
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/user/${selectedId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((respuesta) => respuesta.json())
        .then((respuesta) => setDetail(respuesta));
    }, [selectedId, token]);

    // Práctica 3: Buscar por Nombre GET /user/search/{name}
    async function handleSearch(e?: React.SubmitEvent) {
        
        if (e) e.preventDefault();

        // Si el input está vacío, recargamos la lista completa
        if (!name.trim()) {
            loadUsers();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // encodeURIComponent se asegura de escapar caracteres especiales como # o espacios
            const encodedName = encodeURIComponent(name.trim());
            const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/user/search/${encodedName}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await respuesta.json();

            if (!respuesta.ok) {
                setError(data.detail || 'Error al buscar usuarios');
                return;
            }

            setUsers(data);
        } catch (ex) {
            setError('Error de conexión al buscar');
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    // Botón Limpiar: resetea el input y recarga la lista completa
    function handleClear() {
        setName('');
        loadUsers();
    }

    // Práctica 4: Mostrar nombre y Rol al cargar o cambiar el token
    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                const respuesta1 = await fetch(`${import.meta.env.VITE_API_URL}/user/me/id`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const currentUserId = await respuesta1.json();

                if (!respuesta1.ok) {
                    setError(currentUserId.detail || 'Error al obtener id del Usuario actual');
                    return;
                }

                const respuesta2 = await fetch(`${import.meta.env.VITE_API_URL}/user/${currentUserId.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await respuesta2.json();

                if (!respuesta2.ok) {
                    setError(data.detail || 'Error al obtener el Usuario actual');
                    return;
                }
                setCurrentUser(data);
            } catch {
                setError('Error de conexión al obtener usuario actual');
            }
        }

        fetchCurrentUser();
    }, [token]);

    const [newName,setNewName] = useState<string>('');
    const [newEmail,setNewEmail] = useState<string>('');
    const [newAge,setNewAge] = useState<string>('');
    const [newPassword,setNewPassword] = useState<string>('');
    const [newCountryId,setNewCountryId] = useState<number>(1);

    
    async function handleCreateUser(e: SubmitEvent<HTMLFormElement>) {
        if (e) e.preventDefault();

        setLoading(true);
        setError(null);
        try {
            const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
                method: 'POST',
                headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                body: JSON.stringify({ 
                    name: newName,
                    email: newEmail,
                    age: Number(newAge),
                    password: newPassword, 
                    country_id: Number(newCountryId)
                })
            });

            const data = await respuesta.json()
            
            if(!respuesta.ok) {
                // Si el backend devuelve un string o un mensaje alternativo
                setError(data.detail || 'Ocurrió un error al Crear un Usuario');
                return;
            }
            loadUsers();

            setNewName('');
            setNewEmail('');
            setNewAge('');
            setNewPassword('');
            

            
            

        } catch {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
        
    

    }


    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
            {currentUser && (
                <h3>Hola, {currentUser.name} ({currentUser.roles.map(r => r.name).join(', ')})</h3>
            )}
            <form onSubmit={handleCreateUser} style={{display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px', marginBottom: '20px' }}>
                <label>Nombre:</label>
                <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)} 
                    required 
                    type='text' 
                    placeholder='María'
                />
                <label>Email:</label>
                <input 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)} 
                    required type='email' 
                    placeholder='maria@email.com'
                />
                <label>Edad:</label>
                <input 
                    value={newAge} 
                    onChange={(e) => setNewAge(e.target.value)} 
                    required type='number' 
                    placeholder='29'
                />
                <label>Password:</label>
                <input 
                    value={newPassword} 
                    minLength={4}
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                    type='password' 
                    placeholder='123'
                />
                <label>Selecciona el país:</label>
                <select 
                    value={newCountryId}
                    onChange={(e) => setNewCountryId(Number(e.target.value))}
                >
                    <option value={1}>Argentina</option>
                    <option value={2}>Brasil</option>
                </select>
                <button type='submit'>Crear Usuario</button>

            </form>
            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <label>Buscar por nombre:</label>
                <input 
                    value={name}
                    type='text'
                    placeholder='Ej. Ma'
                    onChange={(e) => setName(e.target.value)}
                />
                {" "}
                <button type='submit'>Buscar</button>
                {" "}
                <button type='button' onClick={handleClear}>Limpiar</button>
            </form>

            <h2>Lista de Usuarios</h2>
            {loading && <p>Cargando...</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <>
                    {(users.length > 0) ? 
                        <p><em>Haz clic en un nombre para ver su detalle:</em></p> :
                            <p style={{color: 'red'}}>No hay usuarios para mostrar</p>
                    }
                    <ul>
                        {users.map(user => (
                            <li 
                                key={user.id}
                                onClick={() => setSelectedId(user.id)}
                                style={{ 
                                    cursor: 'pointer', 
                                    padding: '6px 0',
                                    color: selectedId === user.id ? '#0d6efd' : 'inherit',
                                    fontWeight: selectedId === user.id ? 'bold' : 'normal'
                                }}
                            >
                                {user.name}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {detail && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '16px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    backgroundColor: '#f8f9fa' 
                }}>
                    <h3>Detalle del Usuario</h3>
                    <p><strong>Nombre:</strong> {detail.name}</p>
                    <p><strong>Email:</strong> {detail.email}</p>
                    <p><strong>Edad:</strong> {detail.age}</p>
                    <p><strong>País:</strong> {detail.country ? detail.country.name : 'Sin país'}</p>
                    <p><strong>Roles:</strong> {detail.roles?.length ? detail.roles.map(r => r.name).join(', ') : 'Sin roles'}</p>
                </div>
            )}
        </div>
    );
}

export default UserList;

    