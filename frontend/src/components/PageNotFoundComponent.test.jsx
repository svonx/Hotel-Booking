import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PageNotFoundComponent from './PageNotFoundComponent'; // Adjust the import according to your file structure

describe('PageNotFoundComponent', () => {
  it('Renders with default message when no info is provided', () => {
    render(<PageNotFoundComponent/>);
    expect(screen.getByText(/Page Not Found :\(/i)).toBeInTheDocument();
    expect(screen.getByText(/This page is either not exist, or you are not authorised to view./i)).toBeInTheDocument();
    expect(screen.getByText(/Please check your URL, or/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to home/i })).toHaveAttribute('href', '/');
  });

  it('Renders with custom message when info is provided', () => {
    const customInfo = 'Custom error message';
    render(<PageNotFoundComponent info={customInfo}/>);
    expect(screen.getByText(/Page Not Found :\(/i)).toBeInTheDocument();
    expect(screen.getByText(customInfo)).toBeInTheDocument();
  });

  it('Contains a link to the home page', () => {
    render(<PageNotFoundComponent/>);
    const homeLink = screen.getByRole('link', { name: /go to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
