import React from 'react'
import web3 from './ethereum/web3'
import generateEvidence from './ethereum/generate-evidence'
import generateMetaevidence from './ethereum/generate-meta-evidence'
import * as SimpleEscrowWithERC1497 from './ethereum/simple-escrow-with-erc1497'
import * as Arbitrator from './ethereum/arbitrator'
import Ipfs from 'ipfs-http-client'
import ipfsPublish from './ipfs-publish'

import Container from 'react-bootstrap/Container'
import Jumbotron from 'react-bootstrap/Jumbotron'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Deploy from './Deploy.js'
import Interact from './Interact.js'

import { useState, useEffect } from 'react';

export default function App() {
    const [activeAddress, setActiveAddress] = useState('0x0000000000000000000000000000000000000000')
    const [lastDeployedAddress, setLastDeployedAddress] = useState('0x0000000000000000000000000000000000000000')
    const [accounts, setAccounts] = React.useState([]);
    const [balance, setBalance] = React.useState(false);

    const ipfs = new Ipfs({
      host: 'ipfs.kleros.io',
      port: 5001,
      protocol: 'https'
    })

    useEffect(() => {

      if (window.web3 && window.web3.currentProvider.isMetaMask)
        window.web3.eth.getAccounts((_, accounts) => {
          setActiveAddress(accounts[0])
        })
      else console.error('MetaMask account not detected :(')

      window.ethereum.on('accountsChanged', accounts => {
        setActiveAddress(accounts[0])
      })
    }, []);

  const deploy = async (amount, payee, arbitrator, title, description) => {


    let metaevidence = generateMetaevidence(
      web3.utils.toChecksumAddress(activeAddress),
      web3.utils.toChecksumAddress(payee),
      amount,
      title,
      description
    )
    const enc = new TextEncoder()
    const ipfsHashMetaEvidenceObj = await ipfsPublish(
      'metaEvidence.json',
      enc.encode(JSON.stringify(metaevidence))
    )

    let result = await SimpleEscrowWithERC1497.deploy(
      activeAddress,
      payee,
      amount,
      arbitrator,

      '/ipfs/' +
        ipfsHashMetaEvidenceObj[1]['hash'] +
        ipfsHashMetaEvidenceObj[0]['path']
    )

    setLastDeployedAddress(result._address)
  }

  const load = contractAddress =>
    SimpleEscrowWithERC1497.contractInstance(contractAddress)

  const reclaimFunds = async (contractAddress, value) => {
    await SimpleEscrowWithERC1497.reclaimFunds(
      activeAddress,
      contractAddress,
      value
    )
  }

  const releaseFunds = async contractAddress => {

    await SimpleEscrowWithERC1497.releaseFunds(activeAddress, contractAddress)
  }

  const depositArbitrationFeeForPayee = (contractAddress, value) => {

    SimpleEscrowWithERC1497.depositArbitrationFeeForPayee(
      activeAddress,
      contractAddress,
      value
    )
  }

  const reclamationPeriod = contractAddress =>
    SimpleEscrowWithERC1497.reclamationPeriod(contractAddress)

  const arbitrationFeeDepositPeriod = contractAddress =>
    SimpleEscrowWithERC1497.arbitrationFeeDepositPeriod(contractAddress)

  const remainingTimeToReclaim = contractAddress =>
    SimpleEscrowWithERC1497.remainingTimeToReclaim(contractAddress)

  const remainingTimeToDepositArbitrationFee = contractAddress =>
    SimpleEscrowWithERC1497.remainingTimeToDepositArbitrationFee(
      contractAddress
    )

  const arbitrationCost = (arbitratorAddress, extraData) =>
    Arbitrator.arbitrationCost(arbitratorAddress, extraData)

  const arbitrator = contractAddress =>
    SimpleEscrowWithERC1497.arbitrator(contractAddress)

  const status = contractAddress => SimpleEscrowWithERC1497.status(contractAddress)

  const value = contractAddress => SimpleEscrowWithERC1497.value(contractAddress)

  const submitEvidence = async (contractAddress, evidenceBuffer) => {

  const result = await ipfsPublish('name', evidenceBuffer)

    let evidence = generateEvidence(
      '/ipfs/' + result[0]['hash'],
      'name',
      'description'
    )
    const enc = new TextEncoder()
    const ipfsHashEvidenceObj = await ipfsPublish(
      'evidence.json',
      enc.encode(JSON.stringify(evidence))
    )

    SimpleEscrowWithERC1497.submitEvidence(
      contractAddress,
      activeAddress,
      '/ipfs/' + ipfsHashEvidenceObj[0]['hash']
    )
  }




    return (
      <Container>
        <Row>
          <Col>
            <h1 className="text-center my-5">
              A Simple DAPP Using SimpleEscrowWithERC1497
            </h1>
          </Col>
        </Row>

        <Row>
          <Col>
            <Deploy deployCallback={deploy} />
          </Col>
          <Col>
            <Interact
              arbitratorCallback={arbitrator}
              arbitrationCostCallback={arbitrationCost}
              escrowAddress={lastDeployedAddress}
              loadCallback={load}
              reclaimFundsCallback={reclaimFunds}
              releaseFundsCallback={releaseFunds}
              depositArbitrationFeeForPayeeCallback={
                depositArbitrationFeeForPayee
              }
              remainingTimeToReclaimCallback={remainingTimeToReclaim}
              remainingTimeToDepositArbitrationFeeCallback={
                remainingTimeToDepositArbitrationFee
              }
              statusCallback={status}
              valueCallback={value}
              submitEvidenceCallback={submitEvidence}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form action="https://centralizedarbitrator.netlify.com">
              <Jumbotron className="m-5 text-center">
                <h1>Need to interact with your arbitrator contract?</h1>
                <p>
                  We have a general purpose user interface for centralized
                  arbitrators (like we have developed in the tutorial) already.
                </p>
                <p>
                  <Button type="submit" variant="primary">
                    Visit Centralized Arbitrator Dashboard
                  </Button>
                </p>
              </Jumbotron>
            </Form>
          </Col>
        </Row>
      </Container>
    )
  
}