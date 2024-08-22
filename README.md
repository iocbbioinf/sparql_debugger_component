# SPARQL Debugger

**SPARQL Debugger** is a tool designed to trace the execution of federated SPARQL queries. It provides a visual representation of service executions in tree structures, displaying information such as requests, responses, duration, and the number of results for each service execution.

The tool is divided into two main components:
- **Server:** Handles the backend logic, including REST API and SSE messages. You can find it [here](https://gitlab.elixir-czech.cz/moos/idsm_debug_server).
- **Frontend React Component (this repository):** Renders the service execution tree.

## Publishing as an NPM Library

To publish this component as an NPM library:

1. In the `/package.json` file:
   - Update the `version` attribute as needed.
   
2. Run the following command to build the library:
   - `npm run build`

3. Publish the library using:
   - `npm publish`

## Using This Component in Your App

To use this component in your application:

1. Install the package:
   - Run `npm install sparqldebugtree`

2. Configure the environment variable `REACT_APP_SERVER_URL`. For example, you can set it in a `.env` file.

## Demo Deployment

A demo deployment that is free to use is available [here](https://idsm-react-debugger-1.dyn.cloud.e-infra.cz).
