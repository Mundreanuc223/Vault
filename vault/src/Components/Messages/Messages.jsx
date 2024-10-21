import React, { useState, useEffect } from 'react';
import './Messages.css';
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

const Messages = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                console.log('Fetching username...');  // Debug log
                const response = await fetch('http://127.0.0.1:5000/home', {
                    method: 'GET',
                    credentials: 'include',  // This ensures that cookies (session) are included in the request
                });
                const data = await response.json();
                console.log('Response:', data);  // Log the response data
                if (response.ok) {
                    setUsername(data.message.split(' ')[1]); // Extract the username from the message
                } else {
                    console.error('Not logged in.');
                }
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        };
        fetchUsername();
    }, []);
    

    return (
        <div className='wrapper'>
            <h1>Welcome, {username}</h1>
            <form>
            </form>
        </div>
    );
};

export default Messages;
