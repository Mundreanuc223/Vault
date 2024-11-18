import React from 'react';
import { Routes, Route } from 'react-router-dom';

import './App.css';
import LoginForm from './Components/LoginForm/LoginForm';
import RegistrationForm from "./Components/RegistrationForm/RegistrationForm";
import ResetPasswordForm from './Components/ResetPasswordForm/ResetPasswordForm';
import Home from "./Components/Home/Home";
import Profile from "./Components/Profile/Profile";
import Messages from './Components/Messages/Messages';
import Settings from './Components/Settings/Settings';
import EditProfile from './Components/EditProfile/EditProfile';

function App() {

  return (
      <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/messages" element={<Messages/>} />
          <Route path="/:profileUsername" element={<Profile />} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
  );
}

export default App;