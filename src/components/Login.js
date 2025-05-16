import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (login === 'tech' && password === '1234') {
      localStorage.setItem('loggedInUser', login);
      navigate('/dashboard');
    } else {
      alert('Неверный логин или пароль');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Вход техника</h2>
      <input className="form-control my-2" value={login} onChange={e => setLogin(e.target.value)} placeholder="Логин" />
      <input className="form-control my-2" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" />
      <button className="btn btn-primary" onClick={handleLogin}>Войти</button>
    </div>
  );
};

export default Login;