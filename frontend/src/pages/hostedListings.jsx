import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Image,
  Modal,
  OverlayTrigger,
  ProgressBar,
  Row,
  Table,
  Tooltip as BootstrapTooltip
} from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { PlusLg, X } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Label, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PopupMessage from '../components/PopupMessage';
import SVGRatings from '../components/SVGRatings';
import TopBar from '../components/TopBar';

function HostedListings () {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [myListingsId, setMyListingsId] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(0);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [publishDetailsOpen, setPublishDetailsOpen] = useState(false);
  const [currPublishDetails, setCurrPublishDetails] = useState({});
  const [currPublishAvailability, setCurrPublishAvailability] = useState([]);

  const [currPublishStart, setCurrPublishStart] = useState('');
  const [currPublishEnd, setCurrPublishEnd] = useState('');

  const [currStep, setCurrStep] = useState(0);

  const [diagramData, setDiagramData] = useState([]);

  const [loadingInfo, setLoadingInfo] = useState('');

  const fetchListings = async () => {
    try {
      const allLists = await axios.get('/listings', {});
      const l = allLists.data.listings.filter(x => x.owner === username).map(x => x.id);
      setMyListingsId(l);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const addNewPeriod = (startString, endString) => {
    setCurrPublishAvailability(
      [
        ...currPublishAvailability,
        { start: startString, end: endString }
      ]
    );
  };

  const removePeriod = (periodIndex) => {
    setCurrPublishAvailability(
      currPublishAvailability.filter((x, index) => index !== periodIndex)
    );
  };

  const updatePublishStatus = (idx) => {
    const a = myListings;
    a[idx].published = !a[idx].published;
    setMyListings(a);
  };

  const resetPublishForm = () => {
    setCurrPublishStart('');
    setCurrPublishEnd('');
    setCurrPublishAvailability([]);
    setCurrPublishDetails({});
  };

  const tooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(label));
      const dString = d.toISOString().split('T')[0];

      const getDateName = () => {
        switch (parseInt(label)) {
          case 0:
            return 'Today';
          case 1:
            return 'Yesterday';
          default:
            return `${label} days ago`;
        }
      };

      return (
        <div className="custom-tooltip">
          <p>{`${getDateName()}`}</p>
          <p>{`${dString}`}</p>
          <p><b>{`$${payload[0].value}`}</b></p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const nextStep = () => setCurrStep(s => s + 1);

    if (currStep === 0) {
      setLoadingInfo('Validating your identity...');
      setUsername(Cookies.get('username'));
      setToken(Cookies.get('token'));
      nextStep();
    } else if (currStep === 1) {
      setLoadingInfo('Fetching all listings...');
      fetchListings()
        .then(nextStep);
    } else if (currStep === 2) {
      setLoadingInfo('Analysing listings details...');
      const fetchListingDetails = async () => {
        try {
          const requests = myListingsId.map(id => axios.get(`listings/${id}`, {}));
          const responses = await Promise.all(requests);
          const details = responses.map(response => response.data.listing);
          setMyListings(details);
        } catch (error) {
          console.error('Error fetching listing details:', error);
        }
      };

      fetchListingDetails()
        .then(nextStep);
    } else if (currStep === 3) {
      setLoadingInfo('Loading your hosted listings...');
      const getMyBookings = async () => {
        const response = await axios.get('/bookings', { headers: { Authorization: `Bearer ${token}` } });
        if (!response.data.error) {
          let mb = response.data.bookings;
          mb = mb.filter(x =>
            x.status === 'accepted' &&
            myListingsId.map(x => parseInt(x)).includes(parseInt(x.listingId)) &&
            new Date(x.dateRange.start) >= new Date(new Date().setDate(new Date().getDate() - 30)) &&
            new Date(x.dateRange.start) <= new Date()
          );
          setMyBookings(mb);
        }
      };

      getMyBookings()
        .then(nextStep);
    } else if (currStep === 4) {
      setLoadingInfo('Generating your profit diagram...');
      const d = Array.from({ length: 31 }, (_, day) => ({ days: 30 - day, price: 0 }));
      myBookings.forEach(x => {
        const start = new Date(x.dateRange.start);
        const today = new Date();
        start.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diff = (today - start) / (1000 * 24 * 60 * 60);
        d[30 - diff].price += x.totalPrice;
      });
      setDiagramData(d);
      nextStep();
    } else if (currStep === 5) {
      setIsLoadingListings(false);
    }
  }, [currStep]);

  return (
    <>
      <TopBar/>

      {/* A modal that allows host to publish/unpublish their listings */}
      <Modal
        size={'lg'}
        show={publishDetailsOpen}
        onHide={() => {
          setPublishDetailsOpen(false);
          resetPublishForm();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Publish settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            currPublishDetails.published
              ? (
                <>
                  Unpublish?
                </>
                )
              : (
                <>
                  <Form.Group className={'mt-2'}>
                    <Form.Label>
                      <h5>Create an available time period</h5>
                    </Form.Label>
                    <Row className={'d-flex align-items-center'}>
                      <Col sm={4} md={2}>
                        From <div className={'text-danger d-inline-block'}>*</div>
                      </Col>
                      <Col sm={8} md={3}>
                        <Form.Control type={'date'} value={currPublishStart}
                                      onChange={x => setCurrPublishStart(x.target.value)}/>
                      </Col>
                      <Col sm={4} md={1}>
                        To
                      </Col>
                      <Col sm={8} md={3}>
                        <Form.Control type={'date'} value={currPublishEnd}
                                      onChange={x => setCurrPublishEnd(x.target.value)}/>
                      </Col>
                      <Col sm={4} md={2}>
                        <Button
                          onClick={() => {
                            addNewPeriod(currPublishStart, currPublishEnd);
                            setCurrPublishStart('');
                            setCurrPublishEnd('');
                          }}
                          size={'sm'}
                          aria-label={'add-new-available-time-period'}
                          disabled={currPublishStart === '' || (currPublishEnd !== '' && new Date(currPublishStart) > new Date(currPublishEnd))}
                        >
                          <PlusLg/>
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Label className={'mt-3'}><h5>Your availability:</h5></Form.Label>

                  {currPublishAvailability.length > 0
                    ? (
                        currPublishAvailability.map((x, idx) => (
                        <Form.Group key={`availability-${idx}`}>
                          <Row className={'d-flex align-items-center'}>
                            <Col sm={4} md={1}>
                              From
                            </Col>
                            <Col sm={8} md={4}>
                              <Form.Control type={'date'} value={x.start} readOnly/>
                            </Col>
                            <Col sm={4} md={1}>
                              To
                            </Col>
                            <Col sm={8} md={4}>
                              <Form.Control type={'date'} value={x.end} readOnly/>
                            </Col>
                            <Col sm={2} md={1}>
                              <Button size={'sm'} variant={'outline-danger'} aria-label={'remove-this-available-period'}
                                      onClick={() => removePeriod(idx)}><X/></Button>
                            </Col>
                          </Row>
                        </Form.Group>
                        ))
                      )
                    : (
                      <Alert variant={'warning'} show={currPublishAvailability.length === 0}>
                        No available time period is added.<br/>
                        You must add at least one available time period to publish.
                      </Alert>
                      )
                  }
                </>
                )
          }
        </Modal.Body>

        <Modal.Footer>
          {
            currPublishDetails.published
              ? <Button variant={'danger'}
                        aria-label={'unpublish-this-listing'}
                        onClick={() => {
                          axios.put(`/listings/unpublish/${currPublishDetails.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                          updatePublishStatus(currPublishDetails.position);
                          setPublishDetailsOpen(false);
                        }}>Unpublish</Button>
              : <Button variant={'primary'} disabled={currPublishAvailability.length === 0}
                        aria-label={'publish-this-listing'}
                        onClick={() => {
                          axios.put(`/listings/publish/${currPublishDetails.id}`, { availability: currPublishAvailability }, { headers: { Authorization: `Bearer ${token}` } });
                          updatePublishStatus(currPublishDetails.position);
                          setPublishDetailsOpen(false);
                          resetPublishForm();
                        }}>Publish</Button>
          }
        </Modal.Footer>
      </Modal>

      <PopupMessage
        id={'confirm-delete-modal'}
        show={showConfirmDelete}
        message={'Are you sure you want to delete this property?'}
        onClose={() => {
          setShowConfirmDelete(false);
        }}
        onProceed={async () => {
          try {
            await axios.delete(`/listings/${pendingDeleteId}`, { headers: { Authorization: `Bearer ${token}` } });
          } catch (e) {

          } finally {
            setMyListingsId(myListingsId.filter(x => x !== pendingDeleteId));
            setShowConfirmDelete(false);
          }
        }}
      />

      <Container fluid={'md'} className={'mt-3 d-flex w-100'}>
        <Button className={'ms-auto'} href={'/create_host'}>
          Create
        </Button>
      </Container>

      {
        isLoadingListings
          ? (
            <Container fluid={'md'} className={'mt-3 d-flex justify-content-center'}>
              <ProgressBar min={0} max={4} now={currStep} label={loadingInfo}/>
            </Container>
            )
          : (
            <Container fluid={'md'} className={'mt-3 vstack'}>
              <Alert variant={'info'}>
                <Alert.Heading>My Hosts</Alert.Heading>
                Welcome, <i>{username}</i>! Please check if all details are correct regularly.
              </Alert>

              <ResponsiveContainer width={'100%'} height={300}>
                <BarChart data={diagramData} margin={{ top: 40 }}>
                  <CartesianGrid stroke="#f5f5f5"/>
                  <XAxis dataKey={'days'}><Label value={'days ago'} offset={-3} position={'insideBottom'}/></XAxis>
                  <YAxis><Label value={'profit $'} offset={-30} position={'insideTop'}/></YAxis>
                  <Tooltip content={tooltipContent}/>
                  <Legend/>
                  <Bar dataKey={'price'} fill={'#82ca9d'}/>
                </BarChart>
              </ResponsiveContainer>

              <Table striped bordered hover responsive={'md'} className={'mt-2'}>
                <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Beds No.</th>
                  <th>Bathrooms No.</th>
                  <th>Thumbnail</th>
                  <th>Ratings</th>
                  <th>Reviews No.</th>
                  <th>Price (per night)</th>
                  <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {
                  myListings.map((x, index) => (
                    <tr key={`hosted-listing-${myListingsId[index]}`}>
                      <td>{x.title}</td>
                      <td>{x.metadata.propertyType}</td>
                      <td>
                        {
                          x.metadata.bedrooms.length > 0
                            ? x.metadata.bedrooms.reduce((s, a) => s + parseInt(a), 0)
                            : 'Not specified'
                        }</td>
                      <td>{x.metadata.nBathrooms}</td>
                      <td><Image thumbnail src={x.thumbnail} alt={`thumbnail-image-${x.id}`} width={'100px'}/></td>
                      <td>
                        {
                          x.reviews.length > 0
                            ? <SVGRatings id={myListingsId[index]} reviews={x.reviews}/>
                            : 'No reviews'
                        }
                      </td>
                      <td>{x.reviews.length}</td>
                      <td>{x.price}</td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <BootstrapTooltip id={'tooltip-top-edit'}>
                              Edit information
                            </BootstrapTooltip>
                          }
                        >
                          <Button variant={'primary'} size={'sm'} aria-label={'Edit information'}
                                  onClick={() => navigate(`/hosted_listings/${myListingsId[index]}`)}>
                            <Icon.Pencil size={16}/>
                          </Button>
                        </OverlayTrigger>
                        {' '}
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <BootstrapTooltip id={'tooltip-top-publish'}>
                              Publish setting
                            </BootstrapTooltip>
                          }
                        >
                          <Button variant={'primary'} size={'sm'} aria-label={'Publish settings'}
                                  onClick={() => {
                                    setCurrPublishDetails({
                                      position: index,
                                      id: myListingsId[index],
                                      published: x.published
                                    });
                                    setPublishDetailsOpen(true);
                                  }}
                          >
                            {x.published ? <Icon.Eye size={16}/> : <Icon.EyeSlash size={16}/>}
                          </Button>
                        </OverlayTrigger>
                        {' '}
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <BootstrapTooltip id={'tooltip-top-3'}>
                              View booking requests
                            </BootstrapTooltip>
                          }
                        >
                          <Button variant={'primary'} size={'sm'} aria-label={'View booking requests'}
                                  onClick={() => navigate(`/booking_request/${myListingsId[index]}`)}>
                            <Icon.Book size={16}/>
                          </Button>
                        </OverlayTrigger>
                        {' '}
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <BootstrapTooltip id={'tooltip-top-4'}>
                              Delete host
                            </BootstrapTooltip>
                          }
                        >
                          <Button variant={'danger'} size={'sm'} aria-label={'Delete this host'}
                                  onClick={() => {
                                    setPendingDeleteId(myListingsId[index]);
                                    setShowConfirmDelete(true);
                                  }}
                          >
                            <Icon.Trash size={16}/>
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                }
                </tbody>
              </Table>
            </Container>
            )
      }

    </>
  );
}

export default HostedListings;
