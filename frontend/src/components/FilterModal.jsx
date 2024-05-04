import React from 'react';
import { Alert, Button, ButtonGroup, Col, Form, Modal, Row } from 'react-bootstrap';

function FilterModal (
  {
    show, setShow,
    minBedrooms, setMinBedrooms,
    maxBedrooms, setMaxBedrooms,
    availableStart, setAvailableStart,
    availableEnd, setAvailableEnd,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    sortByRating, setSortByRating,
    setConfirmSearch
  }) {
  return (
    <Modal show={show} onHide={() => setShow(false)} size={'lg'} fullscreen={'md-down'}>
      <Modal.Header closeButton>
        <Modal.Title>Filter</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col sm={12} md={6}>
              <Form.Group>
                <Form.Label>Minimum bedrooms: <b>{minBedrooms === 0 ? 'Any' : minBedrooms}</b></Form.Label>
                <Form.Range min={0} max={10} step={1} value={minBedrooms}
                            onChange={x => setMinBedrooms(parseInt(x.target.value))}/>
              </Form.Group>
            </Col>

            <Col sm={12} md={6}>
              <Form.Group>
                <Form.Label>Maximum bedrooms: <b>{maxBedrooms === 10 ? 'Any' : maxBedrooms}</b></Form.Label>
                <Form.Range min={0} max={10} step={1} value={maxBedrooms}
                            onChange={x => setMaxBedrooms(parseInt(x.target.value))}/>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={12} md={6}>
              <Form.Group>
                <Form.Label>Available from:</Form.Label>
                <Form.Control type={'date'} value={availableStart}
                              onChange={x => setAvailableStart(x.target.value)}></Form.Control>
              </Form.Group>
            </Col>

            <Col sm={12} md={6}>
              <Form.Group>
                <Form.Label>Available until:</Form.Label>
                <Form.Control type={'date'} value={availableEnd}
                              onChange={x => setAvailableEnd(x.target.value)}></Form.Control>
              </Form.Group>
            </Col>
          </Row>

          <Alert variant={'danger'} className={'mt-3'} show={availableStart === '' ^ availableEnd === ''}>
            <b>Available from</b> and <b>Available until</b> should be filled in or not filled in simultaneously.
          </Alert>

          <Alert variant={'danger'} className={'mt-3'}
                 show={(availableStart !== '' && availableEnd !== '' && new Date(availableStart) >= new Date(availableEnd))}>
            <b>Available until</b> should always be later than the <b>Available from</b>.
          </Alert>

          <Row className={'mt-2'}>
            <Col sm={12} md={6}>
              <Form.Group>
                <Form.Label>Minimum price: <b>{minPrice === 0 ? 'Any' : minPrice}</b></Form.Label>
                <Form.Range min={0} max={1000} step={10} value={minPrice}
                            onChange={x => setMinPrice(parseInt(x.target.value))}/>
              </Form.Group>
            </Col>

            <Col sm={12} md={6}>
              <Form.Group>
                <Form.Label>Maximum price: <b>{maxPrice === 1000 ? 'Any' : maxPrice}</b></Form.Label>
                <Form.Range min={0} max={1000} step={10} value={maxPrice}
                            onChange={x => setMaxPrice(parseInt(x.target.value))}/>
              </Form.Group>
            </Col>
          </Row>

          <Row className={'mt-2'}>
            <Form.Label>Sort by rating:</Form.Label>
            <ButtonGroup>
              <Button variant={sortByRating === 0 ? 'primary' : 'outline-primary'} onClick={() => setSortByRating(0)}>
                Not specified
              </Button>
              <Button variant={sortByRating > 0 ? 'primary' : 'outline-primary'} onClick={() => setSortByRating(1)}>
                High to low
              </Button>
              <Button variant={sortByRating < 0 ? 'primary' : 'outline-primary'} onClick={() => setSortByRating(-1)}>
                Low to high
              </Button>
            </ButtonGroup>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant={'outline-dark'} onClick={() => {
          setMinBedrooms(0);
          setMaxBedrooms(10);
          setMinPrice(0);
          setMaxPrice(1000);
          setSortByRating(0);
          setAvailableStart('');
          setAvailableEnd('');
          setConfirmSearch(true);
        }}>Reset</Button>
        <Button
          onClick={() => {
            setConfirmSearch(true);
            setShow(false);
          }}
          disabled={
            (availableStart !== '' && availableEnd !== '' && new Date(availableStart) >= new Date(availableEnd)) ||
            (availableStart === '' ^ availableEnd === '')
          }
        >Search</Button>
        <br/>
      </Modal.Footer>
    </Modal>
  );
}

export default FilterModal;
