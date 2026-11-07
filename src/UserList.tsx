import { useState, useEffect } from 'react';

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

    // Cargar la lista inicial de usuarios (Práctica 2: loading y manejo de errores)
    useEffect(() => {
        async function fetchUsers() {
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

        fetchUsers();
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

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
            <h2>Lista de Usuarios</h2>

            {loading && <p>Cargando...</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && (
                <>
                    <p><em>Haz clic en un nombre para ver su detalle:</em></p>
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

    