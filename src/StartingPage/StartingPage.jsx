import { useState } from 'react';
import logo from '../logo.svg';
import './StartingPage.css';

import { Modal, Button, Container, Col, Row } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');

export default function StartingPage() {
    const [repoFailShow, setRepoFailShow] = useState(false);
    const [redirectTo, setRedirectTo] = useState(null);

    if (redirectTo) {
        return <Redirect push to={{
            pathname: redirectTo.to,
            state: redirectTo.params
        }} />;
    }

    ipcRenderer.once('open-repo-reply', (event, arg) => {
        const res = arg;
        if (res !== undefined) {
            if (res.validRepo) {
                setRedirectTo({ to: "/OpenedRepo", params: { repo: res } });
            }
            else {
                setRepoFailShow(true);
            }
        }
    })

    return (
        <>
            <div className="ExampleContainer">
                <div className="App">
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <p>Welcome</p>
                        <br />
                        <Container fluid>
                            <Row className="justify-content-center">
                                <Col md="auto" lg="auto" sm="auto">
                                    <Button variant="outline-primary" onClick={async () => {
                                        ipcRenderer.send('open-repo');
                                    }}>Open repo</Button>
                                </Col>
                                {/*<Col md="auto" lg="auto" sm="auto">
                                    <Button variant="outline-success" onClick={() => {}}>View manual</Button>
                                </Col>*/}
                            </Row>
                        </Container>
                    </header>
                </div>
            </div>

            <Modal show={repoFailShow} onHide={() => setRepoFailShow(false)}>
                <Modal.Header>
                    <Modal.Title>Not a repo?!</Modal.Title>
                </Modal.Header>
                <Modal.Body>Please select a folder which has a repo. The one you selected does not.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setRepoFailShow(false)}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}