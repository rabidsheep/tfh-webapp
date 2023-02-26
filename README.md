# tfh-webapp
Repository for the TFH Webapp project. Intended for use as an online repository of replay files and VODs from the game Them's Fightin' Herds.

More or less a dead project but I might one day come back to it.

## Local Testing
`npm run serve`

Make sure mongodb is running locally. You might have to change the `url` string in `index.js`.

## Firebase Deployment
Make sure `uri` variable in globals.js is the one that doesn't connect to localhost

- `firebase login` to make sure you're logged in to firebase
- `npm run build` to build dist folder
- `firebase deploy` to deploy

https://tfh-webapp.web.app/#/

## Testing Cloud Functions
- `firebase init emulators` if you haven't initialized emulators
  - Be sure to select Cloud Functions option
- `firebase emulators:start` to run firestore emulator
- `firebase serve --only functions` to deploy functions
