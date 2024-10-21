import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import LoginForm from './Components/LoginForm/LoginForm';
import RegistrationForm from "./Components/RegistrationForm/RegistrationForm";
import ResetPasswordForm from './Components/ResetPasswordForm/ResetPasswordForm';
import Home from "./Components/Home/Home";
import Search from "./Components/Search/Search";
import Messages from "./Components/Messages/Messages"; // Import the Messages component

function App() {

  return (
      <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/messages" element={<Messages />} />
      </Routes>
  );
}

export default App;
