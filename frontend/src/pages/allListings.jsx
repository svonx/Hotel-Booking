import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  FormControl,
  Image,
  InputGroup,
  ProgressBar,
  Row,
} from 'react-bootstrap';
import { Funnel, Geo, People, Search, X } from 'react-bootstrap-icons';
import FilterModal from '../components/FilterModal';
import TopBar from '../components/TopBar';

function AllListings () {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [currStep, setCurrStep] = useState(0);
  const [allBookings, setAllBookings] = useState([]);
  const [allListingsId, setAllListingsId] = useState([]);
  const [allListingsDetails, setAllListingsDetails] = useState([]);
  const [displayListingsDetails, setDisplayListingsDetails] = useState([]);
  const [confirmSearch, setConfirmSearch] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const [titleOrCity, setTitleOrCity] = useState('');
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [maxBedrooms, setMaxBedrooms] = useState(10);
  const [availableStart, setAvailableStart] = useState('');
  const [availableEnd, setAvailableEnd] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortByRating, setSortByRating] = useState(0);

  const [filterDict, setFilterDict] = useState({
    'title or city': titleOrCity,
    'min bedrooms': minBedrooms,
    'max bedrooms': maxBedrooms,
    'available start': availableStart,
    'available end': availableEnd,
    'min price': minPrice,
    'max price': maxPrice,
  });

  const [loadingInfo, setLoadingInfo] = useState('');

  // If all steps are finished, should render the list
  const allFinished = () => setCurrStep(999);

  // Declare what to do in each step
  useEffect(() => {
    const nextStep = () => setCurrStep(s => s + 1);

    if (currStep === 0) {
      setLoadingInfo('Loading...');
      const t = Cookies.get('token');
      if (t) {
        setIsLoggedIn(true);
        setToken(t);
        setUsername(Cookies.get('username'));
      } else {
        setIsLoggedIn(false);
      }
      nextStep();
    } else if (currStep === 1) {
      if (isLoggedIn) {
        setLoadingInfo('Fetching your bookings...');
        axios.get('/bookings', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => setAllBookings(r.data.bookings.filter(x => x.owner === username)))
          .then(nextStep);
      } else {
        nextStep();
      }
    } else if (currStep === 2) {
      setLoadingInfo('Fetching all listings...');
      getAllListings()
        .then(nextStep);
    } else if (currStep === 3) {
      setLoadingInfo('Fetching listings details');
      fetchListingDetails()
        .then(nextStep);
    } else if (currStep === 4) {
      setLoadingInfo('Load all listings...');
      allListingsDetails.forEach((x, index) => {
        x.id = allListingsId[index];
      });
      setAllListingsDetails([...allListingsDetails]);
      const ld = allListingsDetails
        // First sort them in the alphabetical order in case-insensitive.
        .sort((x1, x2) => {
          const t1 = x1.title.toLowerCase();
          const t2 = x2.title.toLowerCase();
          if (t1 < t2) {
            return -1;
          }
          if (t1 > t2) {
            return 1;
          }
          return 0;
        })
        // Sort the list so that listings that involve bookings will appear first
        .sort((x1, x2) => {
          const s1 = isUserBooked(x1.id);
          const s2 = isUserBooked(x2.id);
          if (s1) {
            return s2 ? 0 : -1;
          } else {
            return s2 ? 1 : 0;
          }
        });
      setAllListingsDetails(ld);
      nextStep();
    } else if (currStep === 5) {
      setLoadingInfo('Filter in progress...');
      filterBookingDetails();
      allFinished();
    }
  }, [currStep]);

  // When click the confirm filter button, filter
  useEffect(() => {
    if (currStep === 999 && confirmSearch) {
      setCurrStep(5);
      setConfirmSearch(false);
    }
  }, [confirmSearch]);

  useEffect(() => {
    setFilterDict({
      'title or city': titleOrCity,
      'min bedrooms': minBedrooms,
      'max bedrooms': maxBedrooms,
      'available start': availableStart,
      'available end': availableEnd,
      'min price': minPrice,
      'max price': maxPrice,
      'sort by rating': sortByRating,
    });
  }, [titleOrCity, minBedrooms, maxBedrooms, availableStart, availableEnd, minPrice, maxPrice, sortByRating]);

  useEffect(() => {
    if (minBedrooms > maxBedrooms) {
      setMinBedrooms(maxBedrooms);
    }
  }, [minBedrooms]);

  useEffect(() => {
    if (maxBedrooms < minBedrooms) {
      setMaxBedrooms(minBedrooms);
    }
  }, [maxBedrooms]);

  useEffect(() => {
    if (minPrice > maxPrice) {
      setMinPrice(maxPrice);
    }
  }, [minPrice]);

  useEffect(() => {
    if (maxPrice < minPrice) {
      setMaxPrice(minPrice);
    }
  }, [maxPrice]);

  const getAllListings = async () => {
    try {
      const allLists = await axios.get('/listings', {});
      const l = allLists.data.listings.map(x => x.id);
      setAllListingsId(l);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchListingDetails = async () => {
    try {
      const requests = allListingsId.map(id => axios.get(`listings/${id}`, {}));
      const responses = await Promise.all(requests);
      const details = responses.map(response => response.data.listing);
      setAllListingsDetails(details);
    } catch (error) {
      console.error('Error fetching listing details:', error);
    }
  };

  const filterBookingDetails = () => {
    let filteredListings = allListingsDetails.filter(x => x.published);

    Object.keys(filterDict).forEach(filterProp => {
      const filterVal = filterDict[filterProp];

      if (filterProp === 'title or city' && filterVal !== '') {
        filteredListings = filteredListings.filter(x =>
          x.title.toLowerCase().includes(filterVal.toLowerCase()) ||
          x.address.city.toLowerCase().includes(filterVal.toLowerCase())
        );
      }
      if (filterProp === 'min bedrooms' && filterVal !== 0) {
        filteredListings = filteredListings.filter(x =>
          x.metadata.bedrooms.length >= filterVal
        );
      }
      if (filterProp === 'max bedrooms' && filterVal !== 10) {
        filteredListings = filteredListings.filter(x =>
          x.metadata.bedrooms.length <= filterVal
        );
      }
      if (filterProp === 'min price' && filterVal !== 0) {
        filteredListings = filteredListings.filter(x =>
          x.price >= filterVal
        );
      }
      if (filterProp === 'max price' && filterVal !== 1000) {
        filteredListings = filteredListings.filter(x =>
          x.price <= filterVal
        );
      }
      if (filterProp === 'available start' && filterVal !== '') {
        const _start = new Date(filterVal);
        const _end = new Date(filterDict['available end']);
        filteredListings = filteredListings.filter(lst => {
          return lst.availability.some(period => {
            const pStart = new Date(period.start);
            const pEnd = period.end ? new Date(period.end) : null;
            return _start >= pStart && (
              (period.end !== '' && _end <= pEnd) || (period.end === '')
            );
          });
        });
      }

      if (filterProp === 'sort by rating' && sortByRating !== 0) {
        filteredListings = filteredListings.sort((x1, x2) => {
          const r1 = (x1.reviews.reduce((accum, review) => accum + review.rating, 0) / x1.reviews.length);
          const r2 = (x2.reviews.reduce((accum, review) => accum + review.rating, 0) / x2.reviews.length);
          if (r1 < r2) {
            return filterVal;
          } else if (r1 > r2) {
            return -filterVal;
          }
          return 0;
        });
      }
    });

    setDisplayListingsDetails(filteredListings);
  };

  const isUserBooked = (_lstId) => {
    allBookings.forEach(x => {
      if (x.listingId === _lstId) {
        return true;
      }
    });
    return false;
  };

  return (
    <>
      <TopBar/>

      <FilterModal
        show={showSearchPanel}
        setShow={setShowSearchPanel}
        minBedrooms={minBedrooms}
        setMinBedrooms={setMinBedrooms}
        maxBedrooms={maxBedrooms}
        setMaxBedrooms={setMaxBedrooms}
        availableStart={availableStart}
        setAvailableStart={setAvailableStart}
        availableEnd={availableEnd}
        setAvailableEnd={setAvailableEnd}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        sortByRating={sortByRating}
        setSortByRating={setSortByRating}
        setConfirmSearch={setConfirmSearch}
      />

      {/* Main display area */}
      <Container fluid={'md'} className={'mt-3 d-flex'}>
        <Container>
          <Row>
            <Col md={{ span: 3, offset: 8 }} sm={8}>
              <InputGroup>
                <FormControl
                  type={'text'}
                  value={titleOrCity}
                  onChange={x => {
                    setTitleOrCity(x.target.value);
                  }}
                  placeholder={'City or property title...'}
                  size={'sm'}
                />
                <Button size={'sm'} variant={'outline-secondary'} aria-label={'Clear search content'} onClick={() => {
                  setTitleOrCity('');
                  setConfirmSearch(true);
                }}><X/></Button>
              </InputGroup>
            </Col>
            <Col md={1} sm={4} className={'d-inline-flex'}>
              <Button size={'sm'} variant={'outline-primary'} onClick={() => setConfirmSearch(true)}
                      className={'me-auto'} aria-label={'Search button'}><Search/></Button>
              <Button size={'sm'} variant={'outline-success'} aria-label={'Filter button'}
                      onClick={() => setShowSearchPanel(true)}><Funnel/></Button>
            </Col>
          </Row>
        </Container>
      </Container>

      {currStep < 999
        ? (
          <Container fluid={'md'} className={'mt-3 d-flex justify-content-center'}>
            <ProgressBar min={0} max={5} now={currStep} label={loadingInfo}/>
          </Container>
          )
        : (
          <Container fluid={'md'} className={'mt-3 vstack'}>
            <Alert variant={'info'}>
              <Alert.Heading>All Listings</Alert.Heading>
              Welcome to MyAirBNB! You can see all properties here. Hope you enjoy the trip with our house!
            </Alert>

            <Container className={'d-flex flex-wrap'}>
              {
                displayListingsDetails.map((x, index) => (
                  <Card
                    key={`all-listings-${allListingsId[index]}`}
                    className={'mx-2 px-2 my-2 py-2'}
                    border={isUserBooked(x.id) ? 'info' : 'secondary'}
                  >
                    <Container fluid className={'d-flex justify-content-center'}>
                      <Image src={x.thumbnail} alt={`image for ${x.title}`} height={'170px'}/>
                    </Container>
                    <Card.Title className={'mt-1'}>
                      {x.title}
                    </Card.Title>
                    <Card.Text>
                      <People/> {x.reviews.length} Reviews <br/>
                      <Geo/> {x.address.city}
                    </Card.Text>
                    <Container className={'d-flex justify-content-center'}>
                      <Button
                        href={`/listings/${x.id}` + (availableStart === '' ? '' : `?start=${availableStart}&end=${availableEnd}`)}>Details</Button>
                    </Container>
                  </Card>
                ))
              }
            </Container>
          </Container>
          )
      }
    </>
  );
}

export default AllListings;
