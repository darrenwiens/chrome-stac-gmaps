# chrome-gmaps-stac

A Chrome Extension that adds STAC functionality to Google Maps

## Personal Deployment

1. `npm install`
2. `npm run build`
3. `cp src/materialize/js/nouislider.min.js dist/materialize/js/nouislider.min.js` (something gets borked trying to `build` that file)
4. Go to [chrome://extensions/](chrome://extensions/)
5. `Load unpacked` (select `dist` folder here)
6. Go to [Google Maps](https://www.google.com/maps)
7. Click on the extension, either in extensions drop down or pinned to toolbar

## Development 

This extension was created with [Extension CLI](https://oss.mobilefirst.me/extension-cli/)!


### Available Commands

| Commands | Description |
| --- | --- |
| `npm run start` | build extension, watch file changes |
| `npm run build` | generate release version |
| `npm run docs` | generate source code docs |
| `npm run clean` | remove temporary files |
| `npm run test` | run unit tests |
| `npm run sync` | update config files |

For CLI instructions see [User Guide &rarr;](https://oss.mobilefirst.me/extension-cli/)
