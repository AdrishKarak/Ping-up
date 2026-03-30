import React, { useState } from 'react';
import { dummyConnectionsData } from '../assets/assets';

const Discover = () => {

    const [input, setInput] = useState("");
    const [users, setUsers] = useState(dummyConnectionsData)
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            setUsers([])
            setLoading(true);
            setTimeout(() => {
                setUsers(dummyConnectionsData);
                setLoading(false);
            }, 1000)
        }
    }

    return (
        <div>Discover</div>
    );
};

export default Discover;