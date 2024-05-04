import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import PageNotFoundComponent from '../components/PageNotFoundComponent';
import TopBar from '../components/TopBar';
import { fileToDataUrl } from '../helpers';
import { ALL_AMENITIES } from './createHost';

function EditHost () {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [validated, setValidated] = useState(false);
  const [title, setTitle] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [price, setPrice] = useState(0);
  const [nBeds, setNBeds] = useState('');
  const [nBathrooms, setNBathrooms] = useState(0);
  const [propertyType, setPropertyType] = useState('');
  const [amenity, setAmenity] = useState([]);
  const [tb, setTb] = useState('');
  const [propertyImages, setPropertyImages] = useState([]);

  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`/listings/${listingId}`)
      .then(response => {
        if (Object.keys(response.data.listing).length === 0) {
          setErrorLoading(true);
        }
        setTitle(response.data.listing.title);
        setStreet(response.data.listing.address.street);
        setCity(response.data.listing.address.city);
        setState(response.data.listing.address.state);
        setPostcode(response.data.listing.address.postcode);
        setPrice(parseInt(response.data.listing.price));
        setTb(response.data.listing.thumbnail);
        setNBeds(response.data.listing.metadata.bedrooms.join(','));
        setNBathrooms(parseInt(response.data.listing.metadata.nBathrooms));
        setPropertyType(response.data.listing.metadata.propertyType);
        setAmenity(response.data.listing.metadata.amenities);
        setPropertyImages(response.data.listing.metadata.propertyImages || []);
      })
      .catch(error => {
        console.error('Error fetching listing details:', error);
      });
  }, [listingId]);

  useEffect(() => {
    setToken(Cookies.get('token'));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    let isValid = true;

    if (!form.checkValidity()) {
      e.stopPropagation();
      isValid = false;
    }

    setValidated(true);

    if (isValid) {
      const r = await axios.put(`/listings/${listingId}`, {
        title,
        address: { street, city, state, postcode, country: 'Australia' },
        price,
        thumbnail: tb,
        metadata: {
          bedrooms: nBeds.split(',').map(x => parseInt(x)),
          nBathrooms,
          propertyType,
          amenities: amenity.sort(),
          propertyImages
        }
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (!r.data.error) {
        navigate('/hosted_listings');
      }
    }
  };

  const handleAmenityChange = (e) => {
    const v = parseInt(e.target.id.split('amenity-')[1]);
    setAmenity((x) => {
      if (x.includes(v)) {
        return x.filter(item => item !== v);
      } else {
        return [...x, v].sort();
      }
    });
  };

  const handleFileConvert = async (t) => {
    const file = t.target.files[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setTb(dataUrl);
      } catch (error) {
        alert(error);
        t.target.value = '';
      }
    }
  };

  const handlePropertyImagesConvert = async (t) => {
    const filesConvertPromises = [...t.target.files].map(file => fileToDataUrl(file));
    const urlResults = await Promise.all(filesConvertPromises);
    setPropertyImages(urlResults);
  };

  return (
    <>
      <TopBar/>
      <Container fluid={'sm'}>
        <Breadcrumb>
          <Breadcrumb.Item href={'/hosted_listings'}>My Hosts</Breadcrumb.Item>
          <Breadcrumb.Item active>Edit host</Breadcrumb.Item>
        </Breadcrumb>
      </Container>

      <Container fluid={'sm'} className={'mt-2'}>
        {
          errorLoading
            ? (
              <PageNotFoundComponent info={'This listing is not found, please check your URL and try again.'}/>
              )
            : (
              <Form noValidate validated={validated} onSubmit={handleSave}>
                <Row className={'mb-2'}>
                  <Form.Group as={Col} xs={8} controlId={'create-form-title'}>
                    <Form.Label>Property Title</Form.Label>
                    <Form.Control required value={title} onChange={x => setTitle(x.target.value)}></Form.Control>
                    <Form.Control.Feedback type={'invalid'}>Property title is required</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} xs={4} controlId={'create-form-propertyType'}>
                    <Form.Label>Type</Form.Label>
                    <Form.Select value={propertyType}
                                 onChange={x => setPropertyType(x.target.value)}>
                      <option>house</option>
                      <option>apartment</option>
                    </Form.Select>
                  </Form.Group>
                </Row>

                <Row className={'mb-2'}>
                  <Form.Group as={Col} xs={8} controlId={'create-form-address'}>
                    <Form.Label>Address Street</Form.Label>
                    <Form.Control required value={street} onChange={x => setStreet(x.target.value)}></Form.Control>
                    <Form.Control.Feedback type={'invalid'}>Address street is required</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} xs={4} controlId={'create-form-postcode'}>
                    <Form.Label>Postcode</Form.Label>
                    <Form.Control required pattern={'^\\d{4}$'} value={postcode}
                                  onChange={x => setPostcode(x.target.value)}></Form.Control>
                    <Form.Control.Feedback type={'invalid'}>Must be 4-digit</Form.Control.Feedback>
                  </Form.Group>
                </Row>

                <Row className={'mb-2'}>
                  <Form.Group as={Col} xs={8} controlId={'create-form-city'}>
                    <Form.Label>City</Form.Label>
                    <Form.Control required value={city} onChange={x => {
                      setCity(x.target.value);
                    }}></Form.Control>
                    <Form.Control.Feedback type={'invalid'}>City is required</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} xs={4} controlId={'create-form-state'}>
                    <Form.Label>State</Form.Label>
                    <Form.Select value={state} onChange={x => setState(x.target.value)}>
                      <option disabled>...</option>
                      <option>ACT</option>
                      <option>NSW</option>
                      <option>NT</option>
                      <option>QLD</option>
                      <option>SA</option>
                      <option>TAS</option>
                      <option>VIC</option>
                      <option>WA</option>
                    </Form.Select>
                  </Form.Group>
                </Row>

                <Form.Group className={'mb-2'} controlId={'create-form-country'}>
                  <Form.Label>Country</Form.Label>
                  <Form.Control disabled defaultValue={'Australia'}></Form.Control>
                </Form.Group>

                <Form.Group className={'mb-2'} controlId={'create-form-thumbnail'}>
                  <Form.Label>Thumbnail</Form.Label>
                  <Form.Control
                    type={'file'}
                    accept={'.jpeg, .jpg, .png'}
                    onChange={handleFileConvert}>
                  </Form.Control>
                  {/* <Form.Control.Feedback type={'invalid'}>A thumbnail of the property is required</Form.Control.Feedback> */}
                </Form.Group>

                <Form.Group className={'mb-2'} controlId={'create-form-images'}>
                  <Form.Label>Property Images</Form.Label>
                  <Form.Control
                    type={'file'}
                    accept={'.jpeg, .jpg, .png'}
                    multiple
                    onChange={handlePropertyImagesConvert}>
                  </Form.Control>
                  {/* <Form.Control.Feedback type={'invalid'}>A thumbnail of the property is required</Form.Control.Feedback> */}
                </Form.Group>

                <Row className={'mb-2'}>
                  <Form.Group as={Col} xs={3} controlId={'create-form-price'}>
                    <Form.Label>Price per night</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>A$</InputGroup.Text>
                      <Form.Control required type={'number'} min={'0'} value={price}
                                    onChange={x => setPrice(x.target.value ? parseInt(x.target.value) : 0)}></Form.Control>
                      <Form.Control.Feedback type={'invalid'}>Must not be less than 0</Form.Control.Feedback>
                      <InputGroup.Text>per night</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group as={Col} xs={3} controlId={'create-form-n-bathrooms'}>
                    <Form.Label>Number of bathrooms</Form.Label>
                    <Form.Control required type={'number'} min={'0'} value={nBathrooms}
                                  onChange={x => setNBathrooms(x.target.value ? parseInt(x.target.value) : 0)}></Form.Control>
                    <Form.Control.Feedback type={'invalid'}>Must not be less than 0</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} xs={6} controlId={'create-form-n-beds'}>
                    <Form.Label>Number of beds</Form.Label>
                    <Form.Control required placeholder={'1,2,1'} pattern={'^[0-9]+(,[0-9]+)*$'} value={nBeds}
                                  onChange={x => setNBeds(x.target.value)}></Form.Control>
                    <Form.Text>Please enter number of beds in each bedroom, separated with a comma {'","'}, e.g.
                      1,2,1</Form.Text>
                  </Form.Group>
                </Row>

                <Form.Group controlId={'create-form-amenities'}>
                  <Form.Label>Amenities</Form.Label>
                  <div>
                    {
                      ALL_AMENITIES.map((a, index) => (
                        <Form.Check inline label={a} type={'checkbox'} id={`amenity-${index}`} key={`amenity-${index}`}
                                    onChange={handleAmenityChange} checked={amenity.includes(index)}/>
                      ))
                    }
                  </div>
                </Form.Group>
                <Button type={'submit'} variant={'success'} className={'mt-2'}>Save</Button>
              </Form>

              )
        }
      </Container>
    </>
  );
}

export default EditHost;
