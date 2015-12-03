
require('./styles.css');

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <App 
    start={0.25}
    c2={{x: 0.6, y: 0.25}}
    c3={{x: 0.38, y: 0.75}}
    end={0.8}
  />
, document.getElementById('root'));
