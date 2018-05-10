/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { BaseChannelObserver } from "./BaseChannelObserver";
import { BaseEvent, CommandShowOutput, OmnisharpFailure } from '../omnisharp/loggingEvents';
import { Observable } from "rxjs/Observable";
import { EventStream } from "../EventStream";

export class OmnisharpChannelObserver extends BaseChannelObserver {

    public post = (event: BaseEvent) => {
        switch (event.constructor.name) {
            case CommandShowOutput.name:
                this.showChannel();
                break;
            case OmnisharpFailure.name:
                this.showChannel();
                break;
        }
    }
}

export function channelObserver(
    source: Observable<BaseEvent>,
    showSettings?: {
        eventFilter: (event: BaseEvent) => boolean,
        show: (preserveFocusOrColumn?: boolean) => void,
    },
    clearSettings?: {
        filter: (event: BaseEvent) => boolean,
        clear: () => void
    }) {
    if (showSettings) {
        source
            .filter(event => showSettings.eventFilter(event))
            .subscribe(_ => showSettings.show());
    }

    if (clearSettings) {
        source
            .filter(event => clearSettings.filter(event))
            .subscribe(_ => clearSettings.clear());
    }
}

let omnisharpChannelObserver : (source: Observable<BaseEvent>,show: (preserveFocusOrColumn?: boolean) => void) => channelObserver(
    source, 
    showSettings: { 
        filter : (event) => (event instanceOf CommandShowOutput) || (event instanceOf OmnisharpFailure), show: show});