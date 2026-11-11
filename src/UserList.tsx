import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
}


function UserList({ token }: { token: string }) {
    const [users, setUsers] = useState<User[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [me, setMe] = useState<User | null>(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(async (respuesta) => {

            const data = await respuesta.json();

            if(!respuesta.ok) {
                setError(data.detail);
                return;
            }

            setUsers(data);
        })
    }, [token]);


    useEffect(() => {
        // Devuelve el id del Usuario logueado
        fetch(`${import.meta.env.VITE_API_URL}/user/me/id`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((resp) => resp.json())
        //Devuelve todos los datos del usuario logueado con ese id
        .then(({id}) => fetch(`${import.meta.env.VITE_API_URL}/user/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }))
        .then((resp) => resp.json())
        .then(setMe)

    },[token]);

    if(error) {
        return <p>{error}</p>
    }

    return (
        <div>
            <h1>Hola, {me?.name} </h1>
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

    