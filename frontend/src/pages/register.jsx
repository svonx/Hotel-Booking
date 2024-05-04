import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { Button, Container, Form, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PopupMessage from '../components/PopupMessage';
import TopBar from '../components/TopBar';

function Register () {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPopupInfo('Two passwords mismatch!');
      setShowPopup(true);
      return;
    }

    try {
      const response = await axios.post('/user/auth/register', { name, email, password });
      const token = response.data.token;
      Cookies.set('token', token);
      Cookies.set('username', email);
      navigate('/');
    } catch (e) {
      setPopupInfo('Register failed: ' + e.response.data.error);
      setShowPopup(true);
    }
  };

  return (
    <>
      <TopBar/>
      <Container fluid={'sm'}>

        <PopupMessage show={showPopup} message={popupInfo} onClose={() => setShowPopup(false)}/>

        <h1 className={'mt-5'}>
          Register
        </h1>

        <Form onSubmit={handleSubmit} className={'mt-2 w-100'}>
          <Form.Group controlId={'formRegisterName'} className={'mt-2'}>
            <Form.Label>
              Full name
            </Form.Label>
            <Form.Control type={'text'} value={name} onChange={x => setName(x.target.value)}
                          required/>
          </Form.Group>

          <Form.Group controlId={'formRegisterEmail'}>
            <Form.Label>
              Email
            </Form.Label>
            <Form.Control type={'email'} value={email} onChange={x => setEmail(x.target.value)}
                          required/>
          </Form.Group>

          <Form.Group controlId={'formRegisterPassword'} className={'mt-2'}>
            <Form.Label>
              Password
            </Form.Label>
            <Form.Control type={'password'} value={password} onChange={x => setPassword(x.target.value)}
                          required/>
          </Form.Group>

          <Form.Group controlId={'formRegisterConfirmPassword'} className={'mt-2'}>
            <Form.Label>
              Confirm Password
            </Form.Label>
            <Form.Control type={'password'} value={confirmPassword} onChange={x => setConfirmPassword(x.target.value)}
                          required/>
          </Form.Group>

          <Stack direction={'horizontal'} className={'mt-2'}>
            <Button variant={'primary'} type={'submit'} className={'me-auto'}>
              Register
            </Button>
            <Button variant={'link'} type={'button'} href={'/login'}>
              Already have an account?
            </Button>
          </Stack>
        </Form>
      </Container>
    </>

  );
}

export default Register;
