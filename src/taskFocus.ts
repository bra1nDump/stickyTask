import { Observable, fromEvent, mergeMap, merge, map, of } from 'rxjs'
import { StickyEventKind, TaskFocusEvent } from './model'
// import * as nfc from 'nfc-pcsc'

// in ES6
const NFC = require('nfc-pcsc').NFC;

// without Babel in ES2015
// const { NFC } = require('nfc-pcsc');

const nfc = new NFC(); // optionally you can pass logger

export function taskFocusObservable(): Observable<TaskFocusEvent> {
    fromEvent(nfc, 'error').subscribe((event) => {
        console.log(event)
    })
    return fromEvent(nfc, 'reader')
    .pipe(
        mergeMap((reader:any) => {
            return merge(
                fromEvent(reader, 'card').pipe(
                    map((card:any) => {
                        return <TaskFocusEvent>{
                            kind: StickyEventKind.TaskFocus,
                            taskIdentifier: card.uid,
                            event: 'focusGained'
                        }
                    })
                ),
                fromEvent(reader, 'card.off').pipe(
                    map((card:any) => {
                        return <TaskFocusEvent>{
                            kind: StickyEventKind.TaskFocus,
                            taskIdentifier: card.uid,
                            event: 'focusLost'
                        }
                    })
                ),
                fromEvent(reader, 'error').pipe(
                    mergeMap((error:any) => {
                        console.log(error)
                        return of()
                    })
                ),
                fromEvent(reader, 'end').pipe(
                    mergeMap((error:any) => {
                        console.log(error)
                        return of()
                    })
                ),
            )
        })
    )
}

nfc.on('reader', (reader:any) => {

	console.log(`${reader.reader.name}  device attached`);

	// enable when you want to auto-process ISO 14443-4 tags (standard=TAG_ISO_14443_4)
	// when an ISO 14443-4 is detected, SELECT FILE command with the AID is issued
	// the response is available as card.data in the card event
	// see examples/basic.js line 17 for more info
	// reader.aid = 'F222222222';

	reader.on('card', (card:any) => {

		// card is object containing following data
		// [always] String type: TAG_ISO_14443_3 (standard nfc tags like MIFARE) or TAG_ISO_14443_4 (Android HCE and others)
		// [always] String standard: same as type
		// [only TAG_ISO_14443_3] String uid: tag uid
		// [only TAG_ISO_14443_4] Buffer data: raw data from select APDU response

		console.log(`${reader.reader.name}  card detected`, card);

	});

	reader.on('card.off', (card:any) => {
		console.log(`${reader.reader.name}  card removed`, card);
	});

	reader.on('error', (err:any) => {
		console.log(`${reader.reader.name}  an error occurred`, err);
	});

	reader.on('end', () => {
		console.log(`${reader.reader.name}  device removed`);
	});

});

nfc.on('error', (err:any) => {
	console.log('an error occurred', err);
});
