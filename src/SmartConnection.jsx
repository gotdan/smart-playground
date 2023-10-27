import { React, useState } from 'react'

import './App.css'

import SnippetMenu from './SnippetMenu';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function SmartConnection({onSubmit, endpoint='', client_id='', scope='', snippetUrl}) {
	const [formData, setFormData] = useState({
		endpoint, client_id, scope
	});

	function handleChange(e) {
		setFormData({...formData, [e.target.name]: e.target.value})
	}

	function handleSnippetSelect(value) {
		setFormData({...formData, note: undefined, ...value})
	}

	function handleSubmit(e) {
		e.preventDefault()
		const formattedScope = formData.scope
			.replace(/\r\n|\n|\r/g, " ").replace(/\s+/g, " ");
		if (onSubmit) onSubmit({
			endpoint: formData.endpoint, client_id: formData.client_id, scope: formattedScope
		})
	}

	return <>
		<h2 className="mb-4">Server Settings</h2>

			<div align="end"><SnippetMenu
				title="connections"
				url={snippetUrl}
				onChange={handleSnippetSelect}
			/></div>
			

		<Form onSubmit={handleSubmit}>
		<Form.Group className="mb-3">
			<Form.Label>FHIR Server Url</Form.Label>
			<Form.Control type="url" onChange={handleChange} name="endpoint" value={formData.endpoint} required />
		</Form.Group>

		<Form.Group className="mb-3">
			<Form.Label>Client Id</Form.Label>
			<Form.Control type="text" onChange={handleChange} name="client_id" value={formData.client_id} required />
		</Form.Group>

		<Form.Group className="mb-3">
			<Form.Label>Auth Scopes (space or newline delimited)</Form.Label>
			<Form.Control as="textarea" rows={3} onChange={handleChange} name="scope" value={formData.scope} required />
		</Form.Group>

		<p className="mb-3">
			Redirect URL: {(window.location.href.split("?")[0]||"").replace("index.html", "").replace(/\/$/, "")}
		</p>

		{formData.note && <p className="mb-3 fst-italic">
			{formData.note}
		</p>}

		<Button variant="primary" type="submit">
			Connect
		</Button>
		</Form>
	</>
}

export default SmartConnection
