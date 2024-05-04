import React from 'react';
import { Button, Modal } from 'react-bootstrap';

function PopupMessage ({ show, message, onClose, onProceed }) {
  return (
    <Modal show={show} onHide={ onClose } style={{ display: 'block' }}>
      <Modal.Header>
        <Modal.Title>
          Information
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {message}
      </Modal.Body>

      <Modal.Footer>
        {onProceed
          ? (
            <>
              <Button variant={'secondary'} onClick={onClose}>
                Cancel
              </Button>
              <Button variant={'primary'} onClick={onProceed}>
                Confirm
              </Button>
            </>
            )
          : (
            <Button variant={'primary'} onClick={onClose}>
              Close
            </Button>
            )
        }
      </Modal.Footer>
    </Modal>
  )
}

export default PopupMessage;
