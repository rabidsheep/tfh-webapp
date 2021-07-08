# tfh-webapp
Repository for the TFH Webapp

## local testing
`npm run serve`

make sure mongodb is running locally

you might have to change the `url` string in `index.js`

## firebase deployment
make sure `uri` variable in globals.js is the one that doesn't connect to localhost

`firebase login` to make sure you're logged in to firebase

`npm run build` to build dist folder

`firebase deploy` to deploy

https://tfh-webapp.web.app/#/

## testing cloud functions
`firebase init emulators` if you haven't initialized emulators

-- be sure to select cloud functions option

`firebase emulators:start` to run firestore emulator

`firebase serve --only functions` to deploy functions
