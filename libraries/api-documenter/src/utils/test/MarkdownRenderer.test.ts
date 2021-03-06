// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

/// <reference types='mocha' />

// import { assert } from 'chai';
import * as fsx from 'fs-extra';
import * as path from 'path';
import { FileDiffTest } from '@microsoft/node-core-library';
import { IMarkupPage } from '@microsoft/api-extractor';

import { MarkupBuilder } from '../MarkupBuilder';
import { MarkdownRenderer } from '../MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders markdown', (done: MochaDone) => {

    const outputFolder: string = FileDiffTest.prepareFolder(__dirname, 'MarkdownPageRenderer');

    const markupPage: IMarkupPage = MarkupBuilder.createPage('Test page');

    markupPage.elements.push(MarkupBuilder.createHeading1('Simple bold test'));
    markupPage.elements.push(...MarkupBuilder.createTextElements('This is a '));
    markupPage.elements.push(...MarkupBuilder.createTextElements('bold', { bold: true }));
    markupPage.elements.push(...MarkupBuilder.createTextElements(' word.'));

    markupPage.elements.push(MarkupBuilder.createHeading1('All whitespace bold'));
    markupPage.elements.push(...MarkupBuilder.createTextElements('  ', { bold: true }));

    markupPage.elements.push(MarkupBuilder.createHeading1('Newline bold'));
    markupPage.elements.push(...MarkupBuilder.createTextElements('line 1\nline 2', { bold: true }));

    markupPage.elements.push(MarkupBuilder.createHeading1('Newline bold with spaces'));
    markupPage.elements.push(...MarkupBuilder.createTextElements('  line 1  \n  line 2  \n  line 3  ', { bold: true }));

    markupPage.elements.push(MarkupBuilder.createHeading1('Adjacent bold regions'));
    markupPage.elements.push(...MarkupBuilder.createTextElements('one', { bold: true }));
    markupPage.elements.push(...MarkupBuilder.createTextElements('two', { bold: true }));
    markupPage.elements.push(...MarkupBuilder.createTextElements(' three', { bold: true }));
    markupPage.elements.push(...MarkupBuilder.createTextElements('', { bold: false }));
    markupPage.elements.push(...MarkupBuilder.createTextElements('four', { bold: true }));
    markupPage.elements.push(...MarkupBuilder.createTextElements('non-bold', { bold: false }));
    markupPage.elements.push(...MarkupBuilder.createTextElements('five', { bold: true }));

    markupPage.elements.push(MarkupBuilder.createHeading1('Adjacent to other characters'));
    // Creates a "[" before the bold text
    markupPage.elements.push(MarkupBuilder.createWebLinkFromText('a link', './index.md'));
    markupPage.elements.push(...MarkupBuilder.createTextElements('bold', { bold: true }));
    markupPage.elements.push(...MarkupBuilder.createTextElements('non-bold', { bold: false }));
    markupPage.elements.push(...MarkupBuilder.createTextElements('more-non-bold', { bold: false }));

    markupPage.elements.push(MarkupBuilder.createHeading1('Bad characters'));
    markupPage.elements.push(...MarkupBuilder.createTextElements('*one*two*', { bold: true }));
    markupPage.elements.push(...MarkupBuilder.createTextElements('three*four', { bold: true }));

    markupPage.elements.push(MarkupBuilder.createHeading1('Characters that should be escaped'));
    markupPage.elements.push(...MarkupBuilder.createTextElements(
      'Double-encoded JSON: "{ \\"A\\": 123}"\n\n'));
    markupPage.elements.push(...MarkupBuilder.createTextElements(
      'HTML chars: <script>alert("[You] are #1!");</script>\n\n'));
    markupPage.elements.push(...MarkupBuilder.createTextElements(
      'HTML escape: &quot;\n\n'));
    markupPage.elements.push(...MarkupBuilder.createTextElements(
      '3 or more hyphens: - -- --- ---- ----- ------\n\n'));

    const outputFilename: string = path.join(outputFolder, 'ActualOutput.md');
    fsx.writeFileSync(outputFilename, MarkdownRenderer.renderElements([markupPage], { }));

    FileDiffTest.assertEqual(outputFilename, path.join(__dirname, 'ExpectedOutput.md'));

    done();
  });
});
