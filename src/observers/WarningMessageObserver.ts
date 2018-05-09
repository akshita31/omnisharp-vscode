/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BaseEvent, OmnisharpServerOnError, OmnisharpServerMsBuildProjectDiagnostics } from "../omnisharp/loggingEvents";
import { Scheduler } from 'rxjs/Scheduler';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import { Subscribable } from "rxjs/Observable";
import { Observable } from "rxjs/Observable";
import { NextObserver, ErrorObserver, CompletionObserver } from "rxjs/Observer";

export class WarningMessageObserver implements Subscribable<BaseEvent>{
    
    subscribe(observerOrNext?: NextObserver<BaseEvent> | ErrorObserver<BaseEvent> | CompletionObserver<BaseEvent> | ((value: BaseEvent) => void), error?: (error: any) => void, complete?: () => void): AnonymousSubscription {
        if ((observerOrNext) as ((value: BaseEvent) => void)) {
            return this.debouncedStream.subscribe(<((value: BaseEvent) => void)>observerOrNext, error, complete);
        }

        return this.debouncedStream.subscribe(<NextObserver<BaseEvent> | ErrorObserver<BaseEvent> | CompletionObserver<BaseEvent>> observerOrNext);
    }

    private warningMessageDebouncer: Subject<BaseEvent>;
    private debouncedStream: Observable<BaseEvent>;

    constructor(private disableMsBuildDiagnosticWarning: () => boolean, scheduler?: Scheduler) {
        this.warningMessageDebouncer = new Subject<BaseEvent>();
        this.debouncedStream = this.warningMessageDebouncer.debounceTime(1500, scheduler);
    }

    public post = (event: BaseEvent) => {
        switch (event.constructor.name) {
            case OmnisharpServerOnError.name:
                this.warningMessageDebouncer.next(event);
                break;
            case OmnisharpServerMsBuildProjectDiagnostics.name:
                this.handleOmnisharpServerMsBuildProjectDiagnostics(<OmnisharpServerMsBuildProjectDiagnostics>event);
                break;
        }
    }

    private handleOmnisharpServerMsBuildProjectDiagnostics(event: OmnisharpServerMsBuildProjectDiagnostics) {
        if (!this.disableMsBuildDiagnosticWarning() && event.diagnostics.Errors.length > 0) {
            this.warningMessageDebouncer.next(event);
        }
    }
}