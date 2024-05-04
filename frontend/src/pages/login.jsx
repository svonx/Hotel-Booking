import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { Button, Container, Form, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PopupMessage from '../components/PopupMessage';
import TopBar from '../components/TopBar';

function Login () {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/user/auth/login', { email, password });
      const token = response.data.token;
      Cookies.set('token', token);
      Cookies.set('username', email);
      navigate('/');
    } catch (e) {
      setPopupInfo('Login error: ' + e.response.data.error);
      setShowPopup(true);
    }
  };

  return (
    <>
      <TopBar/>
      <Container fluid={'sm'}>
        <PopupMessage show={showPopup} message={popupInfo} onClose={() => setShowPopup(false)}/>
        <h1 className={'mt-5'}>
          Login
        </h1>

        <Form onSubmit={handleSubmit} className={'mt-2 w-100'}>
          <Form.Group controlId={'formLoginEmail'}>
            <Form.Label>
              Email
            </Form.Label>
            <Form.Control type={'email'} value={email} onChange={u => setEmail(u.target.value)}
                          required/>
          </Form.Group>

          <Form.Group controlId={'formLoginPassword'} className={'mt-2'}>
            <Form.Label>
              Password
            </Form.Label>
            <Form.Control type={'password'} value={password} onChange={p => setPassword(p.target.value)}
                          required/>
          </Form.Group>

          <Stack direction={'horizontal'} className={'mt-2'}>
            <Button variant={'primary'} type={'submit'} className={'me-auto'}>
              Login
            </Button>
            <Button variant={'link'} type={'button'} href={'/register'}>
              No account yet?
            </Button>
          </Stack>
        </Form>
      </Container>
    </>

  );
}

export default Login;
