import React, {useState, useRef}  from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import '../index.css'
import axiosInstance from '../components/AxiosInstance';

function ResidentForm() {

    const imageRef = useRef();
    const [formData, setFormData] = useState({
        'firstName': '',
        'lastName': '',
        'phoneNumber': '',
        'description': '',
        'location': '',
        'image': ''
    })
    const [formErrors, setFormErrors] = useState({
        'location': '',
        'image': ''
    });

    const [residentFormStatusMsg, setResidentFormStatusMsg] = useState("");
    const [isFormSubmitError, setIsFormSubmitError] = useState(false);
    const [formSubmitDisabled, setFormSubmitDisabled] = useState(false);

    const formValid = (formErrors, formData) => {
        let valid = true;
        Object.keys(formErrors).forEach((key) => {
            formErrors[key].length > 0 && (valid = false);
        });
        Object.keys(formData).forEach((key) => {
            formData[key] === null && (valid = false);
        });
        if(formData["image"] === "" || formData["location"] === ""){
            valid = false;
        }
        return valid;
    };

    const imageHandler = (e) => {
        let requiredImage = e.target.files[0];
        setFormData({...formData, image: requiredImage})
    }

    const handleChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        validate(name, value);
    };

    const clearForm = (posted) => {
        setFormData({
            'firstName': '',
            'lastName': '',
            'phoneNumber': '',
            'description': '',
            'location': '',
            'image': ''
        });
        setFormErrors({
            'location': '',
            'image': ''
        });
        if(!posted){
            setResidentFormStatusMsg("");
        }
        imageRef.current.value = null;
    }

    const handleSubmit = (e) => {
        let valid = false;
        setFormSubmitDisabled(true);
        e.preventDefault();
        if (formValid(formErrors, formData)) {
            valid = true;
        } else {
            setFormSubmitDisabled(false);
            setIsFormSubmitError(true);
            setResidentFormStatusMsg("Some of your fields are empty or incorrect");
            setTimeout(function () {
                setResidentFormStatusMsg("");
            }, 10000);
        }
        if(valid){
            setResidentFormStatusMsg("The form was sent.");
            setTimeout(function () {
                setResidentFormStatusMsg("");
            }, 1000);
            const fData = new FormData();
            fData.append("firstName", formData.firstName);
            fData.append("lastName", formData.lastName);
            fData.append("description", formData.description);
            fData.append("location", formData.location);
            fData.append("phoneNumber", formData.phoneNumber);
            fData.append("image", formData.image);
            axiosInstance
            .post("submit_resident_form", fData, {
                "content-type": "multipart/form-data",
            })
            .then((response) => {
                if (response.data.ok) {
                    setFormSubmitDisabled(false);
                    setIsFormSubmitError(false);
                    setResidentFormStatusMsg("Sending the request was successfully received");
                    setTimeout(function () {
                        setResidentFormStatusMsg("");
                    }, 10000);
                    clearForm(true);
                } else {
                    setFormSubmitDisabled(false);
                    setIsFormSubmitError(true);
                    setResidentFormStatusMsg("Some error occured submitting the form");
                    setTimeout(function () {
                        setResidentFormStatusMsg("");
                    }, 10000);
                    console.log("Error");
                }
            })
            .catch((error) => {
                setFormSubmitDisabled(false);
                setIsFormSubmitError(true);
                setResidentFormStatusMsg("Some error Occurred");
                setTimeout(function () {
                    setResidentFormStatusMsg("");
                }, 10000);
                console.log(error);
            });
        }
    }

    const validate = (name, value) => {
        switch (name) {
            case "firstName":
                setFormData({ ...formData, firstName: value });
                if (value.length > 30) {
                    setFormErrors({
                        ...formErrors,
                        phoneNumber: "First Name cannot be more than 30 characters",
                    });
                }
                break;
            case "lastName":
                setFormData({ ...formData, lastName: value });
                if (value.length > 30) {
                    setFormErrors({
                        ...formErrors,
                        phoneNumber: "Last Name cannot be more than 30 characters",
                    });
                }
                break;
            case "phoneNumber":
                setFormData({ ...formData, phoneNumber: value });
                if (value.length > 10) {
                    setFormErrors({
                        ...formErrors,
                        phoneNumber: "Phone Number cannot be more than 10 digits",
                    });
                } else if (value.length < 10) {
                    setFormErrors({
                        ...formErrors,
                        phoneNumber: "Phone Number cannot be less than 10 digits",
                    });
                } else {
                    setFormErrors({ ...formErrors, phoneNumber: "" });
                }
                break;
            case "description":
                setFormData({ ...formData, description: value });
                if (value.length > 300) {
                    setFormErrors({
                    ...formErrors,
                    description: "Description cannot be more than 300 characters",
                    });
                }else{
                    setFormErrors({ ...formErrors, description: "" });
                }
                break;
            case "location":
                setFormData({ ...formData, location: value });
                if (value.length <= 0) {
                    setFormErrors({
                    ...formErrors,
                    location: "Location is required",
                    });
                } else {
                    setFormErrors({ ...formErrors, location: "" });
                }
                break;
            default:
                break;
        }
    };


    return (
        <Row style={{ margin: '40px 0px 40px 0px', padding: '0px' }}>
        <Col className="shadow-lg" style={{ border: '1px solid #DEE2E6', borderRadius: '20px', padding: '20px' }} lg={{ span: 4, offset: 4 }} md={{ span: 4, offset: 4 }} sm={{ span: 4, offset: 4 }}>
            <h5 style={{ 'textAlign': 'center', marginBottom: '15px' }}>RESIDENT FORM</h5>
            <Form id="residentFormData" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="residentForm.firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control name="firstName" value={formData.firstName} type="text" placeholder="First Name" onChange={handleChange} />
                <Row style={{ padding: "0px", margin: "0px" }}>
                    <Col style={{ padding: "0px" }}>
                    {formErrors.firstName && formErrors.firstName.length > 0 && (
                    <span className="float-left error_message">
                        {formErrors.firstName}
                    </span>
                    )}
                    </Col>
                </Row>
            </Form.Group>
            <Form.Group className="mb-3" controlId="residentForm.lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control name="lastName" value={formData.lastName} type="text" placeholder="Last Name" onChange={handleChange}/>
                <Row style={{ padding: "0px", margin: "0px" }}>
                <Col style={{ padding: "0px" }}>
                    {formErrors.lastName && formErrors.lastName.length > 0 && (
                    <span className="float-left error_message">
                    {formErrors.lastName}
                    </span>
                )}
                </Col>
                </Row>
            </Form.Group>
            <Form.Group className="mb-3" controlId="residentForm.phoneNumber">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control name="phoneNumber" value={formData.phoneNumber} type="number" placeholder="Phone Number" onChange={handleChange}/>
                <Row style={{ padding: "0px", margin: "0px" }}>
                    <Col style={{ padding: "0px" }}>
                        {formErrors.phoneNumber && formErrors.phoneNumber.length > 0 && (
                        <span className="float-left error_message">
                        {formErrors.phoneNumber}
                        </span>
                    )}
                    </Col>
                </Row>
            </Form.Group>
            <Form.Group className="mb-3" controlId="residentForm.description">
                <Form.Label>Description</Form.Label>
                <Form.Control placeholder="Description" name="description" value={formData.description} as="textarea" rows={3} onChange={handleChange}/>
                <Row style={{ padding: "0px", margin: "0px" }}>
                    <Col style={{ padding: "0px" }}>
                        {formErrors.description && formErrors.description.length > 0 && (
                        <span className="float-left error_message">
                        {formErrors.description}
                        </span>
                    )}
                    </Col>
                </Row>
            </Form.Group>
            <Form.Group className="mb-3" controlId="residentForm.location">
                <Form.Label>Location</Form.Label>
                <Form.Control placeholder="Location" name="location" value={formData.location} as="textarea" rows={3} onChange={handleChange}/>
                <Row style={{ padding: "0px", margin: "0px" }}>
                    <Col style={{ padding: "0px" }}>
                        {formErrors.location && formErrors.location.length > 0 && (
                        <span className="float-left error_message">
                        {formErrors.location}
                        </span>
                    )}
                    </Col>
                </Row>
            </Form.Group>
            <Form.Group controlId="residentForm.image" className="mb-3">
                <Form.Label>Image</Form.Label>
                <Form.Control ref={imageRef} onChange={imageHandler} name="image" type="file" />
            </Form.Group>
            <Row style={{ padding: "10px 0px 10px 0px", margin: "10px" }}>
                <Col style={{ padding: "0px", textAlign: "center" }}>
                    <Button disabled={formSubmitDisabled} className="btn-block" size="md" form="residentFormData" type="submit" variant="success">Submit 
                        {formSubmitDisabled && 
                            (<Spinner
                                style={{ marginLeft: '10px' }}
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                />
                            )
                        }
                    </Button>
                    <Button style={{ marginLeft: '10px' }} disabled={formSubmitDisabled} className="btn-block" size="md" onClick={clearForm} variant="primary">Clear Form</Button>{' '}
                </Col>
                </Row>
        </Form>
        <Row style={{ margin: "10px 0px 10px 0px", padding: "0px", height: '5px' }}>
            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                <div
                    style={{ textAlign: 'center' }}
                    className={isFormSubmitError?"form_error_message":"form_success_message"}
                >
                    {residentFormStatusMsg}
                </div>
            </Col>
        </Row>
        </Col>
        </Row>
    );
    }

export default ResidentForm;