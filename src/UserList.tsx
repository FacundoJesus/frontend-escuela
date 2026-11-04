import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
}

// Recibes el token como una prop del componente
function UserList({ token }: { token: string }) {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then((respuesta) => respuesta.json())
    .then((respuesta) => setUsers(respuesta));
    }, [token]);

    return (
        <div>
            <h2>Lista de Usuarios</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;

    