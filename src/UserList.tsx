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

// Práctica 8: Interfaz de props que incluye la función callback onUnauthorized
interface UserListProps {
    token: string;
    onUnauthorized: () => void;
}

// Recibes el token y el callback onUnauthorized como props del componente
function UserList({ token, onUnauthorized }: UserListProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detail, setDetail] = useState<UserDetail | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [name, setName] = useState<string>('');

    const [currentUser, setCurrentUser] = useState<UserDetail | null>(null);

    // Práctica 6: Estado para alternar entre "Todos" y "Solo mayores"
    const [soloMayores, setSoloMayores] = useState<boolean>(false);

    // Función reutilizable para cargar la lista completa (acepta filtro de Práctica 6)
    async function loadUsers(mayores: boolean = soloMayores) {
        setLoading(true);
        setError(null);

        // Práctica 6: Si 'mayores' es true consulta GET /user_mayores; si es false consulta GET /user
        const endpoint = mayores ? 'user_mayores' : 'user';

        try {
            const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await respuesta.json();

            // Práctica 8: Chequear 401 ANTES de !respuesta.ok para que onUnauthorized se dispare
            if (respuesta.status === 401) {
                onUnauthorized();
                return;
            }

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
        .then((respuesta) => {
            // Práctica 8: Chequear 401 al consultar detalle
            if (respuesta.status === 401) {
                onUnauthorized();
                return null;
            }
            return respuesta.json();
        })
        .then((respuesta) => {
            if (respuesta) setDetail(respuesta);
        });
    }, [selectedId, token]);

    // Práctica 3: Buscar por Nombre GET /user/search/{name}
    async function handleSearch(e: SubmitEvent<HTMLFormElement>) {
        
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

            // Práctica 8: Chequear 401 al buscar por nombre
            if (respuesta.status === 401) {
                onUnauthorized();
                return;
            }

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

                // Práctica 8: Chequear 401 en /user/me/id
                if (respuesta1.status === 401) {
                    onUnauthorized();
                    return;
                }

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

                // Práctica 8: Chequear 401 en /user/{id}
                if (respuesta2.status === 401) {
                    onUnauthorized();
                    return;
                }

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
                // Las claves (name, email, etc.) vienen del DTO del Backend (CreateUserRequest).
                // Los valores (newName, etc.) son los estados de React capturados en el formulario.
                // Number(...) castea el string del input a número entero requerido por FastAPI.
                body: JSON.stringify({ 
                    name: newName,
                    email: newEmail,
                    age: Number(newAge),
                    password: newPassword, 
                    country_id: Number(newCountryId)
                })
            });

            const data = await respuesta.json()
            
            // Práctica 8: Chequear 401 al crear usuario
            if (respuesta.status === 401) {
                onUnauthorized();
                return;
            }

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

    // Práctica 6: Alterna el filtro de mayores de edad y vuelve a pedir la lista al endpoint correspondiente
    function handleToggleMayores() {
        const nuevoEstado = !soloMayores;
        setSoloMayores(nuevoEstado);
        loadUsers(nuevoEstado);
    }

    //Practica 7
    async function handleDeleteUser(id:number, name:string) {

        //Ventana de confirmacion para borrarlo
        const confirmado = window.confirm(`¿Estas seguro que deseas borrar a ${name}?`)
        if(!confirmado) return;

        setError(null);

        try {
            const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/user/${id}`, {
                method:'DELETE',
                headers: {
                        Authorization: `Bearer ${token}`
                }
            });

            const data = await respuesta.json();

            // Práctica 8: Chequear 401 al borrar usuario
            if (respuesta.status === 401) {
                onUnauthorized();
                return;
            }

            if(!respuesta.ok) {
                setError(data.detail || 'Ocurrió un error al Borrar un Usuario');
                return;
            }

            // Quitar de la lista en memoria usando .filter sin hacer otro fetch
            setUsers((prev) => prev.filter((u) => u.id!== id));

            // Si teníamos abierto el detalle de ese usuario, lo cerramos
            if (selectedId === id) {
                setSelectedId(null);
                setDetail(null);
            }
        
        }catch {
            setError('Error de conexión al eliminar usuario');
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

            {/* Práctica 6: Botón que alterna entre Todos y Solo mayores */}
            <button type="button" onClick={handleToggleMayores}>
                {soloMayores ? "Ver Todos" : "Solo mayores"}
            </button>

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
                                <button type='button' onClick={(e) => {
                                        e.stopPropagation(); // Evita que se abra el detalle al hacer clic en borrar
                                        handleDeleteUser(user.id, user.name);
        }}                      >
                                Borrar
                                </button>
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

    