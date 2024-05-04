import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import NotFoundPage from './pages/404Page';
import AllListings from './pages/allListings';
import BookingRequest from './pages/bookingRequest';
import CreateHost from './pages/createHost';
import EditHost from './pages/editListings.jsx';
import HostedListings from './pages/hostedListings';
import ListingDetails from './pages/listingDetails';
import Login from './pages/login';
import Register from './pages/register';

function App ({ isTest = false }) {
  axios.defaults.baseURL = 'http://localhost:5005';
  const RouterComponent = isTest ? MemoryRouter : BrowserRouter;

  return (
    <RouterComponent>
      <Routes>
        <Route path={'/'} element={<Navigate to={'/listings'} replace/>}/>
        <Route path={'/login'} element={<Login/>}/>
        <Route path={'/register'} element={<Register/>}/>
        <Route path={'/listings'} element={<AllListings/>}/>
        <Route path={'/listings/:listingId'} element={<ListingDetails/>}/>
        <Route path={'/hosted_listings'} element={<HostedListings/>}/>
        <Route path={'/create_host'} element={<CreateHost/>}/>
        <Route path={'*'} element={<NotFoundPage/>}/>
        <Route path={'/hosted_listings/:listingId'} element={<EditHost/>}/>
        <Route path={'/booking_request/:listingId'} element={<BookingRequest/>}/>
      </Routes>
    </RouterComponent>
  );
}

export default App;
