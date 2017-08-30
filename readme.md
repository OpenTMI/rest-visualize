# Rest visualization addon for openTMI

Based on [bogey](https://github.com/cognizo/bogey) - addon spawns Bogey and add winston transport to pipe rest logs to bogey rest api (via POST). Then user can see visualization from: http://localhost:8008 .

## Status
POC

## Installation

```
npm install -g bogey
git clone https://github.com/opentmi/rest-visualize app/addons/rest-visualize
```

you also need to activate meta data from express-winston -transports from file app/express.js:45
