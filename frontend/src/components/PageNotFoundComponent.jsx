import React from 'react';
import { Alert } from 'react-bootstrap';

function PageNotFoundComponent ({ info }) {
  return (
    <>
      <Alert variant={'warning'} className={'mt-2 mx-5'}>
        <Alert.Heading>
          Page Not Found :(
        </Alert.Heading>
        {info || (<span>This page is either not exist, or you are not authorised to view.<br/>
          Please check your URL, or <Alert.Link href={'/'}>go to home</Alert.Link>.</span>)}
      </Alert>
    </>
  );
}

export default PageNotFoundComponent;
