/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BaseEvent, OmnisharpServerOnError, OmnisharpServerMsBuildProjectDiagnostics } from "../omnisharp/loggingEvents";
import { Scheduler } from 'rxjs/Scheduler';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';
import 'rxjs/add/observable/defer';
import { Subscribable } from "rxjs/Observable";
import { Observable } from "rxjs/Observable";
import { NextObserver, ErrorObserver, CompletionObserver, Observer } from "rxjs/Observer";

export function createStuff(source: Observable<BaseEvent>, disableMsBuildDiagnosticWarning: () => boolean, scheduler?: Scheduler) {
    return Observable.defer(() => {
        return Observable.create((observer: Observer<BaseEvent>) => {
            let canStreamDiagnostics = (event: BaseEvent) => {
                if (event instanceof OmnisharpServerMsBuildProjectDiagnostics && !disableMsBuildDiagnosticWarning() && event.diagnostics.Errors.length > 0) {
                    return true;
                }
                return false;
            };

            let serverErrorStream = source.filter(e => e instanceof OmnisharpServerOnError);
            let projectDiagnosticsStream = source.filter(e => canStreamDiagnostics(e));
            let merged = serverErrorStream.merge(projectDiagnosticsStream).debounceTime(1500, scheduler);
            return merged.subscribe(observer);
        }).publish().refCount();
    });
}


export class WarningMessageObserver implements Subscribable<BaseEvent>{

    subscribe(observerOrNext?: NextObserver<BaseEvent> | ErrorObserver<BaseEvent> | CompletionObserver<BaseEvent> | ((value: BaseEvent) => void), error?: (error: any) => void, complete?: () => void): AnonymousSubscription {
        if ((observerOrNext) as ((value: BaseEvent) => void)) {
            return this.debouncedStream.subscribe(<((value: BaseEvent) => void)>observerOrNext, error, complete);
        }

        return this.debouncedStream.subscribe(<NextObserver<BaseEvent> | ErrorObserver<BaseEvent> | CompletionObserver<BaseEvent>>observerOrNext);
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