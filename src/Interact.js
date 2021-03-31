import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Card from 'react-bootstrap/Card'
import InputGroup from 'react-bootstrap/InputGroup'

export default function Interact ({
      escrowAddressInProps, 
      statusCallback,
      loadCallback,
      arbitratorCallback,
      arbitrationCostCallback, 
      reclaimFundsCallback,
      releaseFundsCallback,
      submitEvidenceCallback,
      depositArbitrationFeeForPayeeCallback,
      valueCallback,
      remainingTimeToReclaimCallback,
      remainingTimeToDepositArbitrationFeeCallback}) {

  const initialValues = {
    escrowAddress: escrowAddressInProps,
    remainingTimeToReclaim: 'Unassigned',
    remainingTimeToDepositArbitrationFee: 'Unassigned',
    status: 'Unassigned',
    arbitrator: 'Unassigned',
    value: 'Unassigned',
    fileInput: 'Unassigned'
  }
  const [values, setValues] = useState(initialValues)

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setValues({
  //     ...values,
  //     [name]: value,
  //   });
  // };

  useEffect(()=>{
      setValues({
        ...values,
        escrowAddress})

      updateBadges()

    }, [escrowAddressInProps])


  const onEscrowAddressChange = async e => {
    await setValues({ 
      ...values,
      escrowAddress: e.target.value })

    updateBadges()
  }

  const updateBadges = async () => {
    const { escrowAddress, status } = values

    try {
      await setValues({
        ...values,
        status: await statusCallback(escrowAddress)
      })
    } catch (e) {
      console.error(e)
      setValues({
        ...values,
        status: 'ERROR' })
    }

    try {
      //! ESTE AWAIT NO ESTABA !!!!!!!!!!
      setValues({
        ...values,
        arbitrator: await arbitratorCallback(escrowAddress)
      })
    } catch (e) {
      console.error(e)
      setValues({
        ...values,
        arbitrator: 'ERROR' })
    }

    try {
      setValues({
        ...values,
        value: await valueCallback(escrowAddress) })

    } catch (e) {

        console.error(e)

        setValues({
          ...values,
          value: 'ERROR' })
    }

    if (Number(status) === 0)
      try {
        setValues({
          ...values,
          remainingTimeToReclaim: await remainingTimeToReclaimCallback(escrowAddress)
        })
      } catch (e) {
        console.error(e)

        setValues({
          ...values,
          status: 'ERROR' })
      }

    if (Number(status) === 1)
      try {
        setValues({
          ...values,
          remainingTimeToDepositArbitrationFee: await remainingTimeToDepositArbitrationFeeCallback(escrowAddress)
        })
      } catch (e) {
        console.error(e)
        setValues({
          ...values,
          status: 'ERROR' })
      }
  }

  const onReclaimFundsButtonClick = async e => {
    e.preventDefault()
    const { escrowAddress } = values

    let arbitrator = await arbitratorCallback(escrowAddress)
    console.log(arbitrator, 'ARBITRATOR')

    let arbitrationCost = await arbitrationCostCallback(arbitrator, '')

    await reclaimFundsCallback(escrowAddress, arbitrationCost)

    updateBadges()
  }

  const onReleaseFundsButtonClick = async e => {
    e.preventDefault()
    const { escrowAddress } = values

    await releaseFundsCallback(escrowAddress)
    updateBadges()
  }

  const onDepositArbitrationFeeFromPayeeButtonClicked = async e => {
    e.preventDefault()
    const { escrowAddress } = values

    let arbitrator = await arbitratorCallback(escrowAddress)
    let arbitrationCost = await arbitrationCostCallback(
      arbitrator,
      ''
    )

    await depositArbitrationFeeForPayeeCallback(
      escrowAddress,
      arbitrationCost
    )

    updateBadges()
  }

  const onInput = e => {
    console.log(e.target.files)
    setValues({ 
      ...values,
      fileInput: e.target.files[0] })
    console.log('file input')
  }

  const onSubmitButtonClick = async e => {
    e.preventDefault()
    const { escrowAddress, fileInput } = values
    console.log('submit clicked')
    console.log(fileInput)

    var reader = new FileReader()
    reader.readAsArrayBuffer(fileInput)
    reader.addEventListener('loadend', async () => {
      const buffer = Buffer.from(reader.result)
      submitEvidenceCallback(escrowAddress, buffer)
    })
  }

    const { escrowAddress, fileInput } = values

    return (
      <Container className="container-fluid d-flex h-100 flex-column">
        <Card className="h-100 my-4 text-center" style={{ width: 'auto' }}>
          <Card.Body>
            <Card.Title>Interact</Card.Title>
            <Form.Group controlId="escrow-address">
              <Form.Control
                className="text-center"
                as="input"
                rows="1"
                value={escrowAddress}
                onChange={onEscrowAddressChange}
              />
            </Form.Group>
            <Card.Subtitle className="mt-3 mb-1 text-muted">
              Smart Contract State
            </Card.Subtitle>

            <Badge className="m-1" pill variant="info">
              Status Code: {values.status}
            </Badge>
            <Badge className="m-1" pill variant="info">
              Escrow Amount in Weis: {values.value}
            </Badge>
            <Badge className="m-1" pill variant="info">
              Remaining Time To Reclaim Funds:{' '}
              {values.remainingTimeToReclaim}
            </Badge>
            <Badge className="m-1" pill variant="info">
              Remaining Time To Deposit Arbitration Fee:{' '}
              {values.remainingTimeToDepositArbitrationFee}
            </Badge>
            <Badge className="m-1" pill variant="info">
              Arbitrator: {values.arbitrator}
            </Badge>
            <ButtonGroup className="mt-3">
              <Button
                className="mr-2"
                variant="primary"
                type="button"
                onClick={onReleaseFundsButtonClick}
              >
                Release
              </Button>
              <Button
                className="mr-2"
                variant="secondary"
                type="button"
                onClick={onReclaimFundsButtonClick}
              >
                Reclaim
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={onDepositArbitrationFeeFromPayeeButtonClicked}
                block
              >
                Deposit Arbitration Fee For Payee
              </Button>
            </ButtonGroup>
            <InputGroup className="mt-3">
              <div className="input-group">
                <div className="custom-file">
                  <input
                    type="file"
                    className="custom-file-input"
                    id="inputGroupFile04"
                    onInput={onInput}
                  />
                  <label
                    className="text-left custom-file-label"
                    htmlFor="inputGroupFile04"
                  >
                    {(fileInput && fileInput.name) || 'Choose evidence file'}
                  </label>
                </div>
                <div className="input-group-append">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={onSubmitButtonClick}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </InputGroup>
          </Card.Body>
        </Card>
      </Container>
    )
  }


