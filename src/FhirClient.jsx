import { React, useEffect, useState } from 'react'

import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import {json as jsonLanguage} from '@codemirror/lang-json';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import SnippetMenu from './SnippetMenu';
import buildHyperlinkExtension from './hyperlink';

function  FhirClient({smartClient, method="GET", body='', url='', snippetUrl, dataUrl}) {
	const [pendingRequest, setPendingRequest] = useState();
	const [fhirRequest, setFhirRequest] = useState({body, method, url})
	const [fhirResponse, setFhirResponse] = useState(); 
	const [invalidJson, setInvalidJson] = useState();

	useEffect( () => {
		if (!dataUrl) return;
		setPendingRequest(true);
		fetch(dataUrl)
			.then( response => {
				if (response.status != 200)
					throw(`Server responded with a code of ${response.status}`);
				return response.text() 
			})
			.then ( data => {
				setFhirRequest({...fhirRequest, body: data});
				setPendingRequest(false);
			})
			.catch( error => {
				console.log(error);
				setPendingRequest(false);
			});
	}, [])

	const hyperLinkExtension = 
		buildHyperlinkExtension(smartClient.state.serverUrl, EditorView, handleFhirRequest);

	function handleChange(e) {
		setFhirRequest({...fhirRequest, [e.target.name]: e.target.value})
	}

	function handleJsonChange(value) {
		setFhirRequest({...fhirRequest, body: value})
		try {
			JSON.parse(value)
			setInvalidJson(false)
		} catch (e) {
			setInvalidJson(true)
		}
	}

	function handleSnippetSelect(snippet) {
		setFhirRequest({...fhirRequest, ...snippet, body: JSON.stringify(snippet.body, null, 2)});
	}

	function handleFhirRequest(e, navUrl) {
		e.preventDefault();
		const body = !navUrl && fhirRequest.body && fhirRequest.method != "GET" && fhirRequest.body != "DELETE"
			? fhirRequest.body.replaceAll("{{patientId}}", smartClient.patient.id)
			: null;
		const url = (navUrl || fhirRequest.url || '')
			.replaceAll("{{patientId}}", smartClient.patient.id);
		setPendingRequest(true);
		smartClient.request({
			method: navUrl ? "GET" : fhirRequest.method, 
			url, 
			body, 
			includeResponse: true,
			headers: {"content-type" : "application/json+fhir"}
		}).then( response => {
			setFhirResponse({
				code: response.response.status,
				statusText: response.response.statusText,
				body: JSON.stringify(response.body, null, 2)
			});
			setPendingRequest(false);
		}).catch( error => {
			let errorBody =
				 error.message.split("\n\n").slice(1).join("\n\n");
			setFhirResponse({
				code: error.statusCode,
				statusText: error.statusText,
				body: errorBody
			});
			setPendingRequest(false);
		});
	}

	function renderRequest() {
		if (pendingRequest) return renderWorking();

		return <>
			<h2 className="mb-4">FHIR Request</h2>

			<div align="end" className="mb-3"><SnippetMenu
				title="snippets"
				url={snippetUrl}
				onChange={handleSnippetSelect}
			/></div>

			<p>Scope: {smartClient.state.scope}</p>

			<Form onSubmit={handleFhirRequest}>
			<Form.Group className="mb-3">
				<Form.Label>Relative Url</Form.Label>
				<Form.Control type="text" onChange={handleChange} name="url" value={fhirRequest.url} required />
			</Form.Group>

			<Form.Group className="mb-3">
				<Form.Label>Method</Form.Label>
				<Form.Select onChange={handleChange} name="method" value={fhirRequest.method} required>
					<option value="POST">POST</option>
					<option value="GET">GET</option>
					<option value="PUT">PUT</option>
					<option value="DELETE">DELETE</option>
				</Form.Select>
			</Form.Group>

			{fhirRequest.method != "GET" && fhirRequest.method != "DELETE" && 
				<Form.Group className="mb-3">
					<Form.Label>JSON</Form.Label>
					<CodeMirror value={fhirRequest.body} height="400px" extensions={jsonLanguage()} onChange={handleJsonChange} />
					<small className="form-text text-muted">{invalidJson ? "invalid json" : ""}</small>
				</Form.Group>
			}

			<Button variant="primary" type="submit">
				Submit
			</Button>
			</Form>
		</>
	}

	function renderWorking() {
		return <>
			<h1 className="mb-4">FHIR Request</h1>
			<Spinner animation="border" role="status">
				<span className="visually-hidden">Loading...</span>
			</Spinner>		
		</>
	}

	function renderResponse() {
		if (pendingRequest) return renderWorking();

		const isSuccess =  fhirResponse.code.toString()[0] == "2";
		const value =  fhirResponse.body;
	
		return <>
			<h1 className="mb-4">FHIR Response</h1>
			
			<Button variant="light" className="mb-3" onClick={e => setFhirResponse(null)}>
				&lt; back to request
			</Button>
	
			<Alert variant={isSuccess ? "success" : "danger"} className="mb-3">
				{fhirResponse.code} {fhirResponse.statusText}
			</Alert>
	
			<div>
				<CodeMirror id="cm-readonly" value={value} editable={false} 
					extensions={[jsonLanguage(), hyperLinkExtension]}
				/>
			</div>
	
		</>
	}

	return fhirResponse
		? renderResponse(fhirResponse, setFhirResponse)
		: renderRequest(snippetUrl, fhirRequest, handleFhirRequest);

}

export default FhirClient;