import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import PopupMessage from './PopupMessage';

const TopBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const navigate = useNavigate();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const currentPath = location.pathname;

  useEffect(() => {
    const validateToken = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          await axios.get('/bookings', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setIsLoggedIn(true);
        } catch (e) {
          Cookies.remove('token');
          Cookies.remove('username');
          setIsLoggedIn(false);
        }
      }
    };

    // Only check if the user is logged in
    validateToken()
      .then();
  }, []);

  const handleLogout = async () => {
    const token = Cookies.get('token');
    await axios.post('user/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    Cookies.remove('token');
    window.location = '/';
  };

  return (
    <>
      <PopupMessage
        show={showConfirmLogout}
        message={'Confirm logout?'}
        onClose={() => setShowConfirmLogout(false)}
        onProceed={() => {
          handleLogout();
          setShowConfirmLogout(false);
        }}
      />

      <Navbar expand={'sm'} className={'sticky-top bg-primary mb-2'}>
        <Container fluid>
          <Navbar.Brand href={'/'}>
            MyAirBRB
          </Navbar.Brand>
          <Navbar.Toggle aria-controls={'home-navbar'}/>
          <Navbar.Collapse id={'home-navbar'}>
            <Nav variant={'underline'} activeKey={currentPath}>
              {
                isLoggedIn
                  ? (
                    <>
                      <Nav.Link href={'/hosted_listings'}>My Hosts</Nav.Link>
                      <Nav.Link href={'/listings'}>All Listings</Nav.Link>
                    </>
                    )
                  : null
              }
            </Nav>
            <Nav className={'ms-auto'}>
              {
                isLoggedIn
                  ? <Nav.Link onClick={() => setShowConfirmLogout(true)}>
                    <Button size={'sm'} variant={'outline-dark'}>
                      Logout
                    </Button>
                  </Nav.Link>
                  : <Nav.Link href={'/login'}>
                    <Button size={'sm'} variant={'outline-dark'}>
                      Login
                    </Button>
                  </Nav.Link>
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

    </>
  );
};

export default TopBar;
