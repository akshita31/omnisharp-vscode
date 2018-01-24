/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { should, assert } from 'chai';
import { OmnisharpDownloader } from '../../src/omnisharp/OmnisharpDownloader';

const tmp = require('tmp');

suite("Experiment Omnisharp - Latest Version", () => {
    suiteSetup(() => should());

    test('Returns latest version', () => {
        let versions: string[] = ["1.28.0", "1.27.0", "1.26.0"];
        let latestVersion = GetLatestVersion(versions);
        latestVersion.should.equal("1.28.0");
    })

    test('Ignores unparseable strings', () => {
        let versions: string[] = ["1.28.0", "1.27.0", "1.26.0", "a.b.c"];
        let latestVersion = GetLatestVersion(versions);
        latestVersion.should.equal("1.28.0");
    })

    test('Returns pre-release versions if they are the latest', () => {
        let versions: string[] = ["1.28.0", "1.27.0", "1.26.0", "1.29.0-beta1"];
        let latestVersion = GetLatestVersion(versions);
        latestVersion.should.equal("1.29.0-beta1");
    })

    test('Returns undefined if no valid version exists', () => {
        let versions: string[] = ["a.b.c"];
        let latestVersion = GetLatestVersion(versions);
        assert.equal(latestVersion, undefined);
    })

    test('Returns undefined if folder is empty', () => {
        let versions: string[] = [];
        let latestVersion = GetLatestVersion(versions);
        assert.equal(latestVersion, undefined);
    })

    test('Returns undefined if experimental folder doesnot exist', () => {
        let downloader = new OmnisharpDownloader();
        let latestVersion = downloader.GetLatestInstalledExperimentalVersion("");
        assert.equal(latestVersion, undefined);
    })
})


function GetLatestVersion(versions: string[]): string {
    let downloader = new OmnisharpDownloader();
    let tmpObj = tmp.dirSync({ unsafeCleanup: true });
    addVersionsToDirectory(tmpObj.name, versions);
    let latestVersion = downloader.GetLatestInstalledExperimentalVersion(tmpObj.name);
    tmpObj.removeCallback();
    return latestVersion;
}

function addVersionsToDirectory(dirPath: string, versions: string[]) {
    for (let version of versions) {
        fs.mkdir(`${dirPath}/${version}`, () => { });
    }
}