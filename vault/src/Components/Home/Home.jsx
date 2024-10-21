import React, { useState } from 'react';
import './Home.css';
import Navbar from '../HomeHeader/HomeHeader';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <Navbar />
            <h1>Successful!</h1>
        </div>
    );
};

export default Home;