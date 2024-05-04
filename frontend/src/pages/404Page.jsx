import React from 'react';
import PageNotFoundComponent from '../components/PageNotFoundComponent';
import TopBar from '../components/TopBar';

function NotFoundPage ({ info }) {
  return (
    <>
      <TopBar/>
      <PageNotFoundComponent info={info}/>
    </>
  );
}

export default NotFoundPage;
