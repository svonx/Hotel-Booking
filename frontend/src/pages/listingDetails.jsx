import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import {
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Carousel,
  Col,
  Container,
  Form,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip
} from 'react-bootstrap';
import { Check, Dot, Star, StarFill } from 'react-bootstrap-icons';
import { useParams, useSearchParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import PageNotFoundComponent from '../components/PageNotFoundComponent';
import TopBar from '../components/TopBar';
import { ALL_AMENITIES } from './createHost';

function ListingDetails () {
  const { listingId } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [currStep, setCurrStep] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [finalDays, setFinalDays] = useState(0);
  const [bookingValid, setBookingValid] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastInfo, setToastInfo] = useState('');

  const [allBookings, setAllBookings] = useState([]);
  const [listingDetails, setListingDetails] = useState({});

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMsg, setReviewMsg] = useState('');

  const [searchParams] = useSearchParams();
  const _start = searchParams.get('start');
  const _end = searchParams.get('end');
  const _totalDay =
    _start
      ? countDays(_start, _end)
      : null;

  const [errorLoading, setErrorLoading] = useState(false);

  const getBookingStatus = (_lstId) => {
    const result = [];
    allBookings.forEach(x => {
      if (x.listingId === _lstId) {
        result.push(x.status);
      }
    });
    return result;
  };

  function getAcceptedBookingId () {
    const acceptedBooking = allBookings.find(x =>
      parseInt(x.listingId) === parseInt(listingId) && x.status === 'accepted'
    );

    return acceptedBooking ? acceptedBooking.id : null;
  }

  function countDays (startString, endString) {
    return (new Date(endString) - new Date(startString)) / (1000 * 24 * 60 * 60);
  }

  const capitalize = (s) => {
    return s[0].toUpperCase() + s.slice(1);
  };

  const handleMakeBooking = () => {
    return new Promise((resolve, reject) => {
      const data = {
        dateRange: {
          start: bookingStart,
          end: bookingEnd
        },
        totalPrice: finalDays * listingDetails.price
      };
      axios.post(
        `/bookings/new/${listingId}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then(response => resolve(response.data.listingId))
        .catch(e => reject(e.response.data.error));
    });
  };

  useEffect(() => {
    const nextStep = () => setCurrStep(s => s + 1);
    if (currStep === 0) {
      const t = Cookies.get('token');
      if (t) {
        setIsLoggedIn(true);
        setToken(t);
        setUsername(Cookies.get('username'));
      } else {
        setIsLoggedIn(false);
      }
      setBookingStart(_start || '');
      setBookingEnd(_end || '');
      nextStep();
    } else if (currStep === 1) {
      if (isLoggedIn) {
        axios.get('/bookings', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => setAllBookings(r.data.bookings.filter(x => x.owner === username && x.listingId === listingId)))
          .then(nextStep)
          .catch(() => setErrorLoading(true));
      } else {
        nextStep();
      }
    } else if (currStep === 2) {
      axios.get(`/listings/${listingId}`, {})
        .then(r => {
          if (Object.keys(r.data.listing).length === 0) {
            setErrorLoading(true);
          } else {
            setListingDetails(r.data.listing);
          }
        })
        .then(nextStep);
    }
  }, [currStep]);

  useEffect(() => {
    setBookingValid(
      bookingStart !== '' && bookingEnd !== '' && new Date(bookingEnd) > new Date(bookingStart)
    );
  }, [bookingStart, bookingEnd]);

  useEffect(() => {
    if (bookingValid) {
      setFinalDays(countDays(bookingStart, bookingEnd));
    }
  }, [bookingStart, bookingEnd, bookingValid]);

  return (
    <>
      <TopBar/>

      <Container fluid={'sm'}>
        <Breadcrumb>
          <Breadcrumb.Item href={'/listings'}>All Listings</Breadcrumb.Item>
          <Breadcrumb.Item active>Listing Details</Breadcrumb.Item>
        </Breadcrumb>
      </Container>

      {/* When click [Book now!] button, booking modal should appear */}
      <BookingModal
        show={showBookingModal}
        setShow={setShowBookingModal}
        bookingStart={bookingStart}
        setBookingStart={setBookingStart}
        bookingEnd={bookingEnd}
        setBookingEnd={setBookingEnd}
        showToast={showToast}
        setShowToast={setShowToast}
        toastInfo={toastInfo}
        setToastInfo={setToastInfo}
        bookingValid={bookingValid}
        finalDays={finalDays}
        listingDetails={listingDetails}
        handleMakeBooking={handleMakeBooking}
        setCurrStep={setCurrStep}
      />

      {/* Displaying main body */}
      {
        errorLoading
          ? (
            <PageNotFoundComponent info={'An error occurred. We cannot find this listing.'}/>
            )
          : (
              currStep < 3
                ? (
                <Container fluid={'md'} className={'mt-3 d-flex justify-content-center'}>
                  <Spinner animation="border" variant="primary"/> Loading listings
                </Container>
                  )
                : (
                <Container fluid={'md'} className={'mt-3'}>
                  <Row>
                    <h1>{listingDetails.title}</h1>
                  </Row>

                  <Row>
                    <h4>
                      {
                        [
                          listingDetails.address.street,
                          listingDetails.address.city,
                          listingDetails.address.state,
                          listingDetails.address.postcode,
                          listingDetails.address.country
                        ].join(', ')
                      }
                    </h4>
                  </Row>

                  <Row className={'mt-3 mb-3'}>
                    {
                      allBookings.length > 0
                        ? (
                          <Container>
                            <h4>Your Booking Status:</h4>
                            {
                              allBookings.map((x, index) => (
                                <Badge
                                  key={`status-${index}`}
                                  bg={x.status === 'accepted' ? 'success' : (x.status === 'pending' ? 'warning' : 'danger')}
                                  className={'me-1'}
                                >
                                  {x.status}
                                </Badge>
                              ))
                            }
                          </Container>
                          )
                        : null
                    }

                  </Row>

                  <Row>
                    <Col sm={12} md={4}>
                      <Row>
                        <h4>Your price:</h4><br/>
                        <h1
                          className={'text-success'}>${_totalDay ? listingDetails.price * _totalDay : listingDetails.price}</h1>
                        <h6>{_totalDay && _totalDay > 1 ? `for ${_totalDay} nights` : 'per night'}</h6>
                      </Row>
                      <Row>
                        {
                          isLoggedIn
                            ? (
                                listingDetails.owner === username
                                  ? (
                                  <OverlayTrigger overlay={<Tooltip>You cannot book your own host.</Tooltip>}>
                                    <Row className={'ms-1 me-1'}>
                                      <Button variant={'outline-primary'} disabled>
                                        Book now!
                                      </Button>
                                    </Row>
                                  </OverlayTrigger>
                                    )
                                  : (
                                  <Row className={'ms-1 me-1'}>
                                    <Button variant={'outline-primary'} onClick={() => setShowBookingModal(true)}>
                                      Book now!
                                    </Button>
                                  </Row>
                                    )

                              )
                            : (
                              <Row className={'ms-1 me-1'}>
                                <Button variant={'outline-primary'} href={'/login'}>
                                  Log in to book
                                </Button>
                              </Row>
                              )
                        }
                      </Row>
                    </Col>

                    <Col sm={12} md={8}>
                      <h4>Configuration</h4>
                      <Row>
                        <div>
                          {capitalize(listingDetails.metadata.propertyType)}<Dot/>
                          <b>{listingDetails.metadata.nBathrooms}</b> Bathrooms<Dot/>
                          <b>{listingDetails.metadata.bedrooms.length}</b> Bedrooms<Dot/>
                          <b>{listingDetails.metadata.bedrooms.reduce((s, a) => s + parseInt(a), 0)}</b> Beds
                        </div>
                      </Row>

                      <h4 className={'mt-2'}>Amenities</h4>
                      <Row>
                        {
                          listingDetails.metadata.amenities.length > 0
                            ? (
                                listingDetails.metadata.amenities.map((a, index) => (
                                <Col sm={5} md={3} key={`amenities-${index}`} className={'mt-1'}>
                                  <div className={'text-success'}><Check/>{ALL_AMENITIES[a]}</div>
                                </Col>
                                ))
                              )
                            : (<div>No amenities</div>)
                        }
                      </Row>
                    </Col>
                  </Row>

                  <Container className={'d-flex justify-content-center mt-3'}>
                    <Carousel className={'w-50'}>
                      {[listingDetails.thumbnail, ...(listingDetails.metadata?.propertyImages || [])].map((x, index) => (
                        <Carousel.Item key={`image ${index}`}>
                          <div className={'d-flex justify-content-center bg-dark'}>
                            <img height={400} src={x} alt={`image for the host no. ${index}`}/>
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </Container>

                  <Container className={'mt-2'}>
                    <h4 className={'mt-2'}>Review</h4>
                    {
                      getBookingStatus(listingId).includes('accepted')
                        ? (
                          <div className={'mb-3'}>
                            <Form.Group>
                              <Form.Label>Write a new review:</Form.Label>
                              <Form.Control as={'textarea'} rows={4} onChange={x => setReviewMsg(x.target.value)}/>
                            </Form.Group>

                            <ButtonGroup className={'mt-2'}>
                              {
                                [1, 2, 3, 4, 5].map((x, index) => (
                                  <Button
                                    key={`rating-${index}`}
                                    size={'sm'}
                                    variant={x <= reviewRating ? 'primary' : 'outline-primary'}
                                    onClick={() => setReviewRating(x)}
                                  >{x <= reviewRating ? <StarFill/> : <Star/>}</Button>
                                ))
                              }
                            </ButtonGroup>

                            <ButtonGroup className={'ms-2 mt-2'}>
                              <Button
                                disabled={reviewMsg === ''}
                                size={'sm'}
                                onClick={() => {
                                  const r = {
                                    rating: reviewRating,
                                    msg: reviewMsg
                                  };
                                  axios.put(`/listings/${listingId}/review/${getAcceptedBookingId()}`, { review: r }, { headers: { Authorization: `Bearer ${token}` } })
                                    .then(() => {
                                      setReviewRating(5);
                                      setReviewMsg('');
                                      setCurrStep(2);
                                    })
                                    .catch(e => console.log(e.data.message));
                                }}>Submit</Button>
                            </ButtonGroup>

                          </div>
                          )
                        : null
                    }
                    <h6>{
                      listingDetails.reviews.length === 0
                        ? 'No reviews yet'
                        : `${(listingDetails.reviews.reduce((accum, review) => accum + review.rating, 0) / listingDetails.reviews.length).toFixed(2)}/5 by ${listingDetails.reviews.length} Users`
                    }</h6>
                    {
                      listingDetails.reviews.map((x, index) => (
                        <Container key={`review-${index}`} className={'mt-2'}>
                          <b>{index + 1}.</b>
                          <span className={'text-primary'}>
                            {
                              Array.from({ length: x.rating }).map((_, index2) => (
                                <StarFill key={`rating-${index}-${index2}`} className={'ms-1'}/>)
                              )
                            }
                          </span>
                          <br/>
                          {x.msg}
                        </Container>
                      ))
                    }
                  </Container>
                </Container>
                  )
            )
      }
    </>
  );
}

export default ListingDetails;
