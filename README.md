# SMART Playground
A minimal, standalone [SMART-on-FHIR](https://www.hl7.org/fhir/smart-app-launch/index.html) app for reading and writing [FHIR](https://www.hl7.org/fhir/) resources in JSON format

## Installing and running the app

1. Install prerequisites
	- [Git](https://git-scm.com/downloads)
	- [NodeJs](https://nodejs.org)

2. Clone this repository and install dependencies
	```
	git clone [github path]/smart-playground
	cd smart-playground
	npm i
	```

3. Start the development server  
	```
	npm run dev
	```
4. Open  http://localhost:5173/


## Connection parameters

Connection parameters can be passed in the URL querystring to pre-populate the SMART connection form in the app. Additionally, an array of objects with any of these parameters and a `name` parameter can be listed in a CORS accessible json file and passed in through a `connections` querystring parameter to populate the "connections" dropdown list in the app ([example](./public/connections.json)).

| name | description |
| -- | -- |
| endpoint | server FHIR endpoint |
| client_id | the client_id for this app on the FHIR endpoint's auth server|
| scope | a comma or space delimited set of scopes being requested |

## Request parameters

FHIR request parameters can also be passed in the URL querystring to pre-populate the request form in the app. Additionally, an array of objects with these parameters and a `name` parameter can be listed in a CORS accessible json file and passed in through a `snippets` querystring parameter to populate the "snippets" dropdown list in the app ([example](./public/request-snippets.json)).

| name | description |
| -- | -- |
| method | http method - `get`, `put`, `post` or `delete` |
| url | FHIR url relative to the server endpoint | 
| body | FHIR resource in json format for put and post requests |
| dataurl | path to a CORS accessible FHIR resource in json format to populate the body in put and post requests (will be ignored if included in a snippet file) |

## Template variables

URLs and resources bodies may include a `{{patientId}}` template variable which will be replaced with the id from a patient launch context returned by the server at launch when the request is submitted.