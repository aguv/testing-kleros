import React from 'react'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import { useState, useEffect } from 'react';

export default function Deploy (props) {

  const initialValues = {
    amount: '',
    payee: '',
    arbitrator: '',
    title: '',
    description: ''
  }
  const toBeSaved;

  const [values, setValues] = useState(initialValues)


  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSubmit = async e => {
    const {amount, payee, arbitrator, title, description} = values

    e.preventDefault()
    await props.deployCallback(amount, payee, arbitrator, title, description)
  }

    return (
      <Container>
        <Card className="my-4 text-center " style={{ width: 'auto' }}>
          <Card.Body>
            <Card.Title>Deploy</Card.Title>
            <Form>
              <Form.Group controlId="amount">
                <Form.Control
                  as="input"
                  rows="1"
                  value={values.amount}
                  onChange={handleInputChange}
                  placeholder={'Escrow Amount in Weis'}
                  name={'amount'}
                />
              </Form.Group>
              <Form.Group controlId="payee">
                <Form.Control
                  as="input"
                  rows="1"
                  value={values.payee}
                  onChange={handleInputChange}
                  placeholder={'Payee Address'}
                  name={'payee'}
                />
              </Form.Group>
              <Form.Group controlId="arbitrator">
                <Form.Control
                  as="input"
                  rows="1"
                  value={values.arbitrator}
                  onChange={handleInputChange}
                  placeholder={'Arbitrator Address'}
                  name={'arbitrator'}
                />
              </Form.Group>
              <Form.Group controlId="title">
                <Form.Control
                  as="input"
                  rows="1"
                  value={values.title}
                  onChange={handleInputChange}
                  placeholder={'Title'}
                  name={'title'}
                />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.Control
                  as="input"
                  rows="1"
                  value={values.description}
                  onChange={handleInputChange}
                  placeholder={'Describe The Agreement'}
                  name={'description'}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="button"
                onClick={handleSubmit}
                block
              >
                Deploy
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    )
  }