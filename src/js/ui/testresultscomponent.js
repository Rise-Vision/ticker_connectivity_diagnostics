// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI component to render a series of test results.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.TestResultsComponent');

goog.require('ccd.ui.TestResultComponent');



/**
 * @param {string} title Text title for section of test results.
 * @param {!Array.<!ccd.TestResult>} testResults Subset of test results to
 *    to render.
 * @constructor
 * @implements {ccd.ui.Component}
 */
ccd.ui.TestResultsComponent = function(title, testResults) {
  /** @private @const */
  this.title_ = title;

  /** @private @const */
  this.testResults_ = testResults;
};


/** @override */
ccd.ui.TestResultsComponent.prototype.render = function(element) {
  // Create a div representing this component.
  var containerEelem = document.createElement('div');

  // Render additional HTML for this component.
  var title = document.createElement('div');
  title.className = 'test-result-title test-results-contents';
  title.appendChild(document.createTextNode(this.title_));
  containerEelem.appendChild(title);

  var contentElem = document.createElement('div');
  // Render sub components (i.e., each individual Test Result).
  for (var i = 0; i < this.testResults_.length; i++) {
    var testResult = this.testResults_[i];
    var testResultComponent = new ccd.ui.TestResultComponent(testResult);
    testResultComponent.render(contentElem);
  }
  containerEelem.appendChild(contentElem);

  // Finally render the element.
  element.appendChild(containerEelem);
  return containerEelem;
};
