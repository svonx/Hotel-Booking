import React from 'react';
import { Alert, Button, Form, Modal, Toast } from 'react-bootstrap';

function BookingModal (
  {
    show, setShow,
    bookingStart, setBookingStart,
    bookingEnd, setBookingEnd,
    showToast, setShowToast,
    toastInfo, setToastInfo,
    bookingValid, finalDays, listingDetails,
    handleMakeBooking, setCurrStep
  }) {
  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Booking Confirm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.FloatingLabel label={'From'}>
            <Form.Control type={'date'} value={bookingStart} onChange={x => setBookingStart(x.target.value)}/>
          </Form.FloatingLabel>
          <Form.FloatingLabel label={'To'}>
            <Form.Control type={'date'} value={bookingEnd} onChange={x => setBookingEnd(x.target.value)}/>
          </Form.FloatingLabel>
        </Form>
        <Toast className={'mt-3'} onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Body>{toastInfo}</Toast.Body>
        </Toast>
        <Alert show={!bookingValid} variant={'danger'} className={'mt-3'}>
          Both <b>From</b> and <b>To</b> should be filled.<br/>
          <b>To</b> should be later than <b>From</b>.
        </Alert>
        <Alert show={bookingValid} variant={'success'} className={'mt-3'}>
          You will pay: <b>${finalDays * listingDetails.price}</b> for <b>{finalDays}</b> nights.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button
          disabled={!bookingValid}
          onClick={() => {
            handleMakeBooking()
              .then(() => {
                setToastInfo('Success!');
                setShowToast(true);
                setTimeout(() => setShow(false), 1000);
                setCurrStep(1);
              })
              .catch(e => {
                setToastInfo(e);
                setShowToast(true);
              });
          }}>Proceed</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BookingModal;
