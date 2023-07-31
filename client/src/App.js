import React from 'react';
import './app.css'
import WebSock from "./WebSock";
import RabbitMQ from "./RabbitMQ";

function App() {

  return (
      <div>
        {/*<RabbitMQ/>*/}
          <WebSock/>
      </div>
  )
}


export default App;
