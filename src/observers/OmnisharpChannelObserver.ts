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

export function showChannel(
    source: Observable<BaseEvent>,
    showSettings?: {
        showEventFilter: (event: BaseEvent) => boolean,
        showChannel: (preserveFocusOrColumn?: boolean) => void,
    },
    clearSettings?: {
        clearEventFilter: (event: BaseEvent) => boolean,
        clearChannel: () => void
    }) {
    if (showSettings) {
        source
            .filter(event => showSettings.showEventFilter(event))
            .subscribe(_ => showSettings.showChannel());
    }

    if (clearSettings) {
        source
            .filter(event => clearSettings.clearEventFilter(event))
            .subscribe(_ => clearSettings.clearChannel());
    }
}