/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BaseChannelObserver } from "./BaseChannelObserver";
import { BaseEvent, DotnetTestRunStart, DotnetTestRunFailure, DotnetTestsInClassRunStart, DotnetTestDebugStart, DotnetTestsInClassDebugStart } from "../omnisharp/loggingEvents";

export default class DotnetTestChannelObserver extends BaseChannelObserver {
    public post = (event: BaseEvent) => {
        switch (event.constructor.name) {
            case DotnetTestRunStart.name:
            case DotnetTestRunFailure.name:   
            case DotnetTestsInClassRunStart.name: 
            case DotnetTestDebugStart.name:    
            case DotnetTestsInClassDebugStart.name:    
                this.showChannel();
                break;
        }
    }
}