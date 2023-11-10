import React from 'react';
import { useState, useEffect } from 'react'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './App.css'

import SmartConnection from './SmartConnection.jsx'
import FhirClient from './FhirClient';

import {Container, Row, Col, Alert, Navbar} from 'react-bootstrap';
import FHIR, { oauth2 as SMART} from "fhirclient";

function App() {
	const [smartClient, setSmartClient] = useState()
	const [errorMessage, setErrorMessage] = useState()

	const urlParams = Object.fromEntries(new URLSearchParams(location.search));

	["method", "url", "body", "snippets", "dataurl"].forEach(param => {
		if (urlParams[param]) 
			sessionStorage.setItem(param, urlParams[param]);
	});

	useEffect( () => {
		SMART.ready().then( client => {
			setSmartClient(client);
		}).catch( error => {
			if (error.message.indexOf("No 'state' parameter found") > -1)
				return;
			setErrorMessage(error.message)
		})
	}, []);

	function handleAuthSubmit(data) {
		setErrorMessage(null);
		if (data.isOpen) {
			const client = FHIR.client(data.endpoint);
			client.patientId = data.patientId;
			setSmartClient(client);
			return;
		}
		SMART.authorize({
			client_id: data.client_id,
			scope: data.scope,
			iss: data.endpoint,
			redirectUri: (window.location.href.split("?")[0]||"").replace("index.html", "").replace(/\/$/, "")
		});
	}

	return <>
	
		<Navbar bg="secondary" data-bs-theme="dark">
			<Container>
				<Navbar.Brand>Argonaut SMART-on-FHIR Playground</Navbar.Brand>
			</Container>
		</Navbar>

		<div className="m-4"><Container><Row><Col>
			{errorMessage && 
				<Alert variant="danger">
					An error occurred:<br/>{errorMessage}
				</Alert>
			}

			{!smartClient &&
				<SmartConnection
					endpoint={urlParams.endpoint||''}
					client_id={urlParams.client_id||''}
					scope={urlParams.scope||''}		
					isOpen={(urlParams.isOpen||'').toLowerCase() == 'true' ? true : false}		
					patientId={urlParams.patientId||''}		
					snippetUrl={urlParams.connections || "connections.json"}
					onSubmit={handleAuthSubmit} 
				/>
			}

			{smartClient && 
				<FhirClient 
					smartClient={smartClient}
					dataUrl={sessionStorage.getItem("dataurl")}
					method={(sessionStorage.getItem("method")||"GET").toUpperCase()}
					body={(sessionStorage.getItem("body")||"")}
					url={(sessionStorage.getItem("url")||"")}
					snippetUrl={sessionStorage.getItem("snippets") || "request-snippets.json"}
				/> 
			}
		</Col></Row></Container></div>
	</>
}

export default App
