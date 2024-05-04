import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Cookies from 'js-cookie';
import React from 'react';
import TopBar from './TopBar';

jest.mock('js-cookie');
jest.mock('axios');

describe('TopBar Component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Check render correctly and brand (MyAirBRB) always appear', () => {
    render(<TopBar/>);
    expect(screen.getByText('MyAirBRB')).toBeInTheDocument();
  });

  it('Check when not login (no token), there is a login button', () => {
    render(<TopBar/>);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('Check when login, there is a logout button', async () => {
    Cookies.get.mockReturnValue('dummy_token');
    axios.get.mockResolvedValue({ data: { bookings: [] } });
    render(<TopBar/>);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('Test confirm logout modal can be closed correctly qby pressing "cancel" ', async () => {
    Cookies.get.mockReturnValue('dummy_token');
    axios.get.mockResolvedValue({ data: { bookings: [] } });
    render(<TopBar/>);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Confirm logout?')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Logout'));
    expect(screen.queryByText('Cancel')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(screen.queryByText('Confirm logout?')).not.toBeInTheDocument());
  });

  it('Removes token and navigates to home on successful logout', async () => {
    Cookies.get.mockReturnValue('dummy_token');
    axios.get.mockResolvedValue({ data: { bookings: [] } });
    render(<TopBar/>);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(screen.getByText('Logout')).toBeInTheDocument();

    expect(screen.queryByText('Confirm logout?')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Logout'));
    expect(screen.getByText('Confirm logout?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    const removeSpy = jest.spyOn(Cookies, 'remove');
    expect(removeSpy).toHaveBeenCalledWith('token');
    expect(window.location.href).toBe('http://localhost/');
  });

  it('Check if two tabs (after login) lead to the correct url', async () => {
    Cookies.get.mockReturnValue('dummy_token');
    axios.get.mockResolvedValue({ data: { bookings: [] } });
    render(<TopBar/>);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const myHostsBtn = screen.getByText('My Hosts');
    const allListingsBtn = screen.getByText('All Listings');
    expect(myHostsBtn).toBeInTheDocument();
    expect(allListingsBtn).toBeInTheDocument();

    expect(myHostsBtn).toHaveAttribute('href', '/hosted_listings');
    expect(allListingsBtn).toHaveAttribute('href', '/listings');
  });

  it('Check if token validation fails, remove token', async () => {
    axios.get.mockRejectedValue(new Error('Token validation failed'));
    Cookies.get.mockReturnValue('dummy_token');
    render(<TopBar/>);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    expect(Cookies.remove).toHaveBeenCalledWith('token');
    expect(Cookies.remove).toHaveBeenCalledWith('username');
  });
});
