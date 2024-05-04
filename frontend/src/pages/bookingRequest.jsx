import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Badge, Breadcrumb, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Check2, X } from 'react-bootstrap-icons';
import { useParams } from 'react-router-dom';
import PageNotFoundComponent from '../components/PageNotFoundComponent';
import TopBar from '../components/TopBar';

function BookingRequest () {
  const { listingId } = useParams();
  const [listingDetails, setListingDetails] = useState({});
  const [bookingRequests, setBookingRequests] = useState([]);
  const [daysOnline, setDaysOnline] = useState(0);
  const [daysBookedThisYear, setDaysBookedThisYear] = useState(0);
  const [profitThisYear, setProfitThisYear] = useState(0);
  const [token, setToken] = useState('');
  const [currStep, setCurrStep] = useState(0);

  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const nextStep = () => setCurrStep((s) => s + 1);

    if (currStep === 0) {
      setToken(Cookies.get('token'));
      nextStep();
    } else if (currStep === 1) {
      axios
        .get(`/listings/${listingId}`, {})
        .then((response) => {
          if (Object.keys(response.data.listing).length === 0) {
            setErrorLoading(true);
          } else {
            setListingDetails(response.data.listing);
            const createdDate = new Date(response.data.listing.postedOn);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysOnline(response.data.listing.postedOn ? diffDays : 0);
            nextStep();
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
    } else if (currStep === 2) {
      axios
        .get(`/bookings?listingId=${listingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setBookingRequests(
            response.data.bookings.filter((x) => x.listingId === listingId)
          );
          nextStep();
        })
        .catch((error) => {
          setErrorLoading(true);
          console.log(error.message);
        });
    } else if (currStep === 3) {
      let totalDays = 0;
      let totalProfit = 0;
      bookingRequests.forEach((booking) => {
        if (
          booking.status === 'accepted' &&
          new Date(booking.dateRange.start).getFullYear() ===
          new Date().getFullYear()
        ) {
          const start = new Date(booking.dateRange.start);
          const end = new Date(booking.dateRange.end);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
          totalProfit += diffDays * listingDetails.price;
        }
      });
      setDaysBookedThisYear(totalDays);
      setProfitThisYear(totalProfit);
      nextStep();
    }
  }, [currStep]);

  const acceptBooking = async (bookingId) => {
    axios.put(
      `/bookings/accept/${bookingId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => setCurrStep(2));
  };

  const rejectBooking = async (bookingId) => {
    axios.put(
      `/bookings/decline/${bookingId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => setCurrStep(2));
  };

  const generateBadge = (s) => {
    switch (s) {
      case 'accepted':
        return <Badge bg={'success'}>{s}</Badge>;
      case 'pending':
        return <Badge bg={'warning'}>{s}</Badge>;
      default:
        return <Badge bg={'danger'}>{s}</Badge>;
    }
  };

  return (
    <>
      <TopBar/>
      <Container fluid={'sm'}>
        <Breadcrumb>
          <Breadcrumb.Item href={'/hosted_listings'}>My Hosts</Breadcrumb.Item>
          <Breadcrumb.Item active>Booking Requests</Breadcrumb.Item>
        </Breadcrumb>
      </Container>

      <Container fluid={'sm'}>
        {
          errorLoading
            ? (<PageNotFoundComponent
              info={'An error occurred. This listing is not found, please check your URL and try again.'}/>)
            : (
              <>
                <Row className="mb-4">
                  <Col>
                    <Card className="shadow">
                      <Card.Body>
                        <Card.Title>
                          <h1>{listingDetails.title}</h1>
                        </Card.Title>
                        <Row>
                          <Col sm={12} md={2}>
                            Days online:
                          </Col>
                          <Col>
                            <span className="text-primary">{daysOnline > 0 ? daysOnline : 'not published'}</span>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={12} md={2}>
                            Days booked this year:
                          </Col>
                          <Col>
                            <span className="text-primary">{daysBookedThisYear}</span>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={12} md={2}>
                            Profit this year:
                          </Col>
                          <Col>
                            <span className="font-weight-bold text-success">${profitThisYear}</span>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <h2 className="mb-4">Booking Requests/History</h2>
                <Row>
                  <Col>
                    {bookingRequests.map((booking, index) => (
                      <Card key={`booking-${index}`} className="mb-3 shadow">
                        <Card.Body>
                          <Row>
                            <Col sm={10}>
                              <Row>
                                <Col sm={12} md={2}>
                                  Booking ID:
                                </Col>
                                <Col sm={12} md={10}>
                                  <span className={'text-secondary'}>{booking.id}</span>
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={12} md={2}>
                                  Status:
                                </Col>
                                <Col sm={12} md={10}>
                                  {generateBadge(booking.status)}
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={12} md={2}>
                                  From:
                                </Col>
                                <Col sm={12} md={10}>
                                  <span className={'text-primary'}>{booking.dateRange.start}</span>
                                </Col>
                              </Row>
                              <Row>
                                <Col sm={12} md={2}>
                                  To:
                                </Col>
                                <Col sm={12} md={10}>
                                  <span className={'text-primary'}>{booking.dateRange.end}</span>
                                </Col>
                              </Row>
                            </Col>
                            <Col sm={2} className={'d-flex align-items-center'}>
                              {booking.status === 'pending' && (
                                <Container>
                                  <Button
                                    as={Col}
                                    sm={8}
                                    className="me-2"
                                    variant="success"
                                    onClick={() => {
                                      acceptBooking(booking.id);
                                    }}
                                  >
                                    <Check2/> Accept
                                  </Button>
                                  <Button
                                    variant="danger"
                                    as={Col}
                                    sm={8}
                                    onClick={() => {
                                      rejectBooking(booking.id);
                                    }}
                                  >
                                    <X/> Reject
                                  </Button>
                                </Container>
                              )}
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </Col>
                </Row>
              </>
              )
        }

      </Container>
    </>
  );
}

export default BookingRequest;
