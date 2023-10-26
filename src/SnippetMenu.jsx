import { React, useEffect, useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown';

function SnippetMenu({onChange, url, title='snippets'}) {

	const [snippets, setSnippets] = useState();
	const [snippetLoading, setSnippetLoading] = useState(true);

	useEffect( () => {
		if (!url) setSnippetLoading(false);
		fetch(url)
			.then( response => response.json() )
			.then ( data => {
				setSnippets(data);
				setSnippetLoading(false);
			})
			.catch( error => {
				console.log(error);
				setSnippetLoading(false)
			});
	}, [])

	function handleChange(name) {
		if (onChange) {
			const snippet = snippets.find( s => s.name == name);
			onChange(snippet)
		}
	}

	function snippetMenu() {
		return <Dropdown.Menu>
			{snippets.map( s => <Dropdown.Item 
				onClick={e => handleChange(s.name)}
				key={s.name}
			>
				{s.name}
			</Dropdown.Item>)}
		</Dropdown.Menu>
	}

	return <>
		{(snippetLoading || snippets) && <Dropdown>
			<Dropdown.Toggle variant="light" size="small"
				disabled={snippetLoading}
			>
				{snippetLoading ? "loading...": title}
			</Dropdown.Toggle>
			{snippets && snippetMenu()}
		</Dropdown>}
	</>
}

export default SnippetMenu;