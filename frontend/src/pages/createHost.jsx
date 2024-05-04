import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Col, Container, Form, InputGroup, ProgressBar, Row, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { fileToDataUrl } from '../helpers';

export const ALL_AMENITIES = [
  'A/C', 'Heater', 'Cloth Washer', 'Cloth Dryer', 'TV', 'Fridge', 'Wi-Fi', 'Free Parking', 'BBQ Area', 'Pets Allowed'
];

function CreateHost () {
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState('house');
  const [street, setStreet] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('...');
  const [price, setPrice] = useState(0);
  const [nBathrooms, setNBathrooms] = useState(0);
  const [nBeds, setNBeds] = useState('');
  const [tb, setTb] = useState('');
  const [amenity, setAmenity] = useState([]);
  const [validated, setValidated] = useState(false);
  const [token, setToken] = useState('');
  const [creatingListing, setCreatingListing] = useState(false);
  const [enableBulkImport, setEnableBulkImport] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState([]);
  const [detectedNListings, setDetectedNListing] = useState(0);
  const [processStatus, setProcessStatus] = useState([]);
  const [disableBulkProcess, setDisableBulkProcess] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const t = Cookies.get('token');
    setToken(t);
  }, []);

  const getDefaultPostcode = () => {
    if (postcode.length !== 4) {
      setState('...');
      return;
    }
    const p = parseInt(postcode);
    if ((p >= 1000 && p <= 1999) || (p >= 2000 && p <= 2599) || (p >= 2619 && p <= 2899) || (p >= 2921 && p <= 2999)) {
      setState('NSW');
    } else if ((p >= 200 && p <= 299) || (p >= 2600 && p <= 2618) || (p >= 2900 && p <= 2920)) {
      setState('ACT');
    } else if ((p >= 3000 && p <= 3999) || (p >= 8000 && p <= 8999)) {
      setState('VIC');
    } else if ((p >= 4000 && p <= 4999) || (p >= 9000 && p <= 9999)) {
      setState('QLD');
    } else if (p >= 5000 && p <= 5999) {
      setState('SA');
    } else if (p >= 6000 && p <= 6999) {
      setState('WA');
    } else if (p >= 7000 && p <= 7999) {
      setState('TAS');
    } else if (p >= 800 && p <= 999) {
      setState('NT');
    } else {
      setState('...');
    }
  };

  useEffect(() => {
    getDefaultPostcode();
  }, [postcode]);

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

  const handleBulkImport = (t) => {
    const file = t.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const JsonResult = JSON.parse(content);
      setBulkImportResult(JsonResult.listings);
    };

    reader.readAsText(file);
    setDisableBulkProcess(false);
  };

  useEffect(() => {
    setDetectedNListing(bulkImportResult.length);
    setProcessStatus(Array.from({ length: bulkImportResult.length }).map((_) => 0));
  }, [bulkImportResult]);

  const processBulkImport = async () => {
    const func = async (index) => {
      const ld = bulkImportResult[index];

      try {
        const pd = {
          title: ld.title,
          address: {
            street: ld['address street'],
            city: ld.city,
            state: ld.state,
            postcode: ld.postcode,
            country: 'Australia'
          },
          price: ld.price,
          thumbnail: ld.thumbnail,
          metadata: {
            bedrooms: ld.nBeds.map(x => parseInt(x)),
            nBathrooms: ld.nBathrooms,
            propertyType: ld.type,
            amenities: ld.amenities.map(x => ALL_AMENITIES.indexOf(x))
          }
        };

        const r = await axios.post('listings/new', pd, { headers: { Authorization: `Bearer ${token}` } });

        setProcessStatus(previousStatus => {
          const updatedStatus = [...previousStatus];
          updatedStatus[index] = r.data.error ? -1 : 1;
          return updatedStatus;
        });
      } catch (e) {
        setProcessStatus(previousStatus => {
          const updatedStatus = [...previousStatus];
          updatedStatus[index] = -1;
          return updatedStatus;
        });
      }
    };

    setDisableBulkProcess(true);
    for (let index = 0; index < bulkImportResult.length; index++) {
      await func(index);
      await new Promise(resolve => setTimeout(resolve, 1000));
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

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    let isValid = true;

    if (!form.checkValidity()) {
      e.stopPropagation();
      isValid = false;
    }

    setValidated(true);

    if (isValid) {
      setCreatingListing(true);
      const r = await axios.post('listings/new', {
        title,
        address: { street, city, state, postcode, country: 'Australia' },
        price,
        thumbnail: tb,
        metadata: {
          bedrooms: nBeds.split(',').map(x => parseInt(x)),
          nBathrooms,
          propertyType,
          amenities: amenity.sort()
        }
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (!r.data.error) {
        navigate('/hosted_listings');
      }
    }
  };

  return (
    <>
      <TopBar/>
      <Container fluid={'sm'}>
        <Breadcrumb>
          <Breadcrumb.Item href={'/hosted_listings'}>My Hosts</Breadcrumb.Item>
          <Breadcrumb.Item active>Create Host</Breadcrumb.Item>
        </Breadcrumb>
      </Container>

      <Container fluid={'sm'} className={'mt-2'}>
        <h1>Create a host!</h1>
        <Form.Check
          type={'switch'}
          value={enableBulkImport}
          onClick={() => setEnableBulkImport(!enableBulkImport)}
          label={'Change to ' + (enableBulkImport ? 'single creation' : 'bulk import')}
          className={'mt-4 mb-4'}
        />
        {
          enableBulkImport
            ? (
              <Container>
                <Row>
                  <Form.Group>
                    <Form.Label>Import your JSON file:</Form.Label>
                    <Form.Control type={'file'} accept={'.json'} onChange={handleBulkImport}/>
                  </Form.Group>
                </Row>

                <Row className={'mt-2'}>
                  <Container>
                    <Button variant={'success'} className={'mt-3'} onClick={processBulkImport}
                            disabled={disableBulkProcess}>Submit</Button>
                  </Container>
                </Row>

                <Row className={'mt-2'}>
                  <Container>
                    Detected {detectedNListings} listings. Click <span className={'text-success'}>Submit</span> to
                    start.<br/>
                    Pending <span className={'text-warning'}>{processStatus.filter(x => x === 0).length}</span>.
                    Passed <span className={'text-success'}>{processStatus.filter(x => x === 1).length}</span>.
                    Error or skip <span className={'text-danger'}>{processStatus.filter(x => x === -1).length}</span>.
                    <ProgressBar>
                      {
                        processStatus.map((x, index) => {
                          switch (x) {
                            case -1:
                              return <ProgressBar key={`stacked-progressbar-${index}`} now={100 / processStatus.length}
                                                  variant={'danger'}/>;
                            case 1:
                              return <ProgressBar key={`stacked-progressbar-${index}`} now={100 / processStatus.length}
                                                  variant={'success'}/>;
                            default:
                              return null;
                          }
                        })
                      }
                    </ProgressBar>
                  </Container>
                </Row>
              </Container>
              )
            : (
              <Form noValidate validated={validated} onSubmit={handleCreate}>
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
                    required
                    type={'file'}
                    accept={'.jpeg, .jpg, .png'}
                    onChange={handleFileConvert}>
                  </Form.Control>
                  <Form.Control.Feedback type={'invalid'}>A thumbnail of the property is required</Form.Control.Feedback>
                </Form.Group>

                <Row className={'mb-2'}>
                  <Form.Group as={Col} xs={3} controlId={'create-form-price'}>
                    <Form.Label>Price per night</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>A$</InputGroup.Text>
                      <Form.Control required type={'number'} min={'0'} value={price}
                                    onChange={x => setPrice(parseInt(x.target.value))}></Form.Control>
                      <Form.Control.Feedback type={'invalid'}>Must not be less than 0</Form.Control.Feedback>
                      <InputGroup.Text>per night</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group as={Col} xs={3} controlId={'create-form-n-bathrooms'}>
                    <Form.Label>Number of bathrooms</Form.Label>
                    <Form.Control required type={'number'} min={'0'} value={nBathrooms}
                                  onChange={x => setNBathrooms(parseInt(x.target.value))}></Form.Control>
                    <Form.Control.Feedback type={'invalid'}>Must not be less than 0</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Col} xs={6} controlId={'create-form-n-beds'}>
                    <Form.Label>Number of beds</Form.Label>
                    <Form.Control required placeholder={'1,2,1'} pattern={'^[0-9]+(,[0-9]+)*$'} value={nBeds}
                                  onChange={x => setNBeds(x.target.value)}></Form.Control>
                    <Form.Text>
                      Please enter number of beds in each bedroom, seperated with a comma {'","'}, e.g. 1,2,1
                    </Form.Text>
                  </Form.Group>
                </Row>

                <Form.Group controlId={'create-form-amenities'}>
                  <Form.Label>Amenities</Form.Label>
                  <div>
                    {
                      ALL_AMENITIES.map((a, index) => (
                        <Form.Check inline label={a} type={'checkbox'} id={`amenity-${index}`} key={`amenity-${index}`}
                                    onChange={handleAmenityChange}/>
                      ))
                    }
                  </div>
                </Form.Group>

                {creatingListing
                  ? <Button type={null} variant={'warning'} className={'mt-2'} disabled>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    /> Creating...
                  </Button>
                  : <Button type={'submit'} variant={'success'} className={'mt-2'}>Create</Button>
                }
              </Form>
              )
        }
      </Container>

    </>
  );
}

export default CreateHost;
