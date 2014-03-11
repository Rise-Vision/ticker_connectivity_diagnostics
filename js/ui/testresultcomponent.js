// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI component to render a test result.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.TestResultComponent');

goog.require('ccd.ui.MetricsHelper');
goog.require('ccd.ui.TestResultLogs');
goog.require('ccd.ui.globals');



/**
 * @param {!ccd.TestResult} testResult Results of connectivity test.
 * @constructor
 * @implements {ccd.ui.Component}
 */
ccd.ui.TestResultComponent = function(testResult) {
  /**
   * @private {ccd.TestResult}
   * @const
   */
  this.testResult_ = testResult;

  /**
   * @private {ccd.ui.MetricsHelper}
   */
  this.uiMetricsHelper_ = ccd.ui.MetricsHelper.getInstance();

  /**
   * @private {Element}
   */
  this.titleElem_ = null;

  /**
   * @private {Element}
   */
  this.resultFrame_ = null;
};


/** @override */
ccd.ui.TestResultComponent.prototype.render = function(element) {
  this.resultFrame_ = document.createElement('div');
  this.resultFrame_.className = 'test-results-contents-frame';
  this.resultFrame_.addEventListener('click',
      this.toggleShowMoreInformation_.bind(this,
      this.testResult_.getTestId()),
      false);
  this.resultFrame_.addEventListener('keyup',
      this.toggleShowMoreInformation_.bind(this,
      this.testResult_.getTestId()),
      false);

  // Set variables that depend upon the test result.
  var divImageClass = '';
  var titleClassName = '';
  switch (this.testResult_.getTestVerdict()) {
    case ccd.TestVerdict.NO_PROBLEM:
      titleClassName = 'test-title test-verdict-pass';
      divImageClass = 'no-problem-result-title-img';
      break;
    case ccd.TestVerdict.POTENTIAL_PROBLEM:
      titleClassName = 'test-title test-verdict-warning';
      divImageClass = 'potential-problem-result-title-img';
      break;
    case ccd.TestVerdict.PROBLEM:
      titleClassName = 'test-title test-verdict-fail';
      divImageClass = 'problem-result-title-img';
      break;
  }
  var moreInfoDomId = 'test-result-more-info-' + this.testResult_.getTestId();

  // Create Test Result title.
  this.titleElem_ = document.createElement('div');
  this.titleElem_.className = titleClassName;

  ccd.ui.globals.lastTabIndex++;
  this.titleElem_.tabIndex = ccd.ui.globals.lastTabIndex;
  this.titleElem_.setAttribute('aria-expanded', 'false');
  this.titleElem_.setAttribute('aria-controls', moreInfoDomId);
  this.titleElem_.innerHTML = '<div class="test-title-contents-cell">' +
      '<div class="' + divImageClass + '"></div>' +
      '</div>';

  var titleContentsElem = document.createElement('div');
  titleContentsElem.className = 'test-title-contents-cell';
  titleContentsElem.innerHTML = this.testResult_.getTitle();
  this.titleElem_.appendChild(titleContentsElem);
  this.resultFrame_.appendChild(this.titleElem_);

  // Create More Information container.
  this.moreInfoElem_ = document.createElement('div');
  this.moreInfoElem_.id = moreInfoDomId;
  this.moreInfoElem_.className = ccd.ui.globals.Css.HIDDEN;
  this.resultFrame_.appendChild(this.moreInfoElem_);

  // Create test result Subtitle.
  var testSubtitle = document.createElement('div');
  testSubtitle.appendChild(document.createTextNode(
      this.testResult_.getSubtitle()));
  testSubtitle.className = 'test-subtitle';
  this.moreInfoElem_.appendChild(testSubtitle);

  var logsContainer = document.createElement('div');
  var testResultLogs = new ccd.ui.TestResultLogs(this.testResult_);
  testResultLogs.render(logsContainer);
  this.moreInfoElem_.appendChild(logsContainer);

  // Finally render.
  element.appendChild(this.resultFrame_);

  return this.resultFrame_;
};


/**
 * @param {ccd.TestId} testId Test ID of the test whose more information
 *    container to toggle.
 * @param {Event} event The mouse event to toggle show more information.
 * @private
 */
ccd.ui.TestResultComponent.prototype.toggleShowMoreInformation_ =
    function(testId, event) {
  if (event && event.type == 'keyup' &&
      event.keyCode !== ccd.ui.globals.KeyCode.ENTER) {
    // Key was pressed, but it is not Enter. Do not toggle.
    return;
  }

  // Due to tabIndex being present on a DIV or A, clicking on those elements
  //   will not release the :focus state, meaning there is still an outline.
  // Listen for clicks and release the :focus by bluring.
  // @see http://nemisj.com/focusable/
  // @see http://stackoverflow.com/questions/6203189/
  if (event && event.type == 'click') {
    this.resultFrame_.blur();
  }

  // Prevent clicking on the logs <textarea> from collapsing the more
  //   information field.
  if (event.srcElement.className == 'test-results-logs-textarea') {
    return;
  }

  // Record that the more information area was clicked on.
  this.uiMetricsHelper_.expandTestResult();

  // Toggle the result frame element and more information element
  // TODO(ebeach): simplify CSS as per CL/51287148
  if (this.moreInfoElem_.className == ccd.ui.globals.Css.HIDDEN) {
    this.moreInfoElem_.className = 'element-block';
    this.resultFrame_.className =
        'test-results-contents-frame test-results-contents-frame-expanded';
    this.titleElem_.setAttribute('aria-expanded', true);
  } else {
    this.moreInfoElem_.className = ccd.ui.globals.Css.HIDDEN;
    this.resultFrame_.className =
        'test-results-contents-frame';
    this.titleElem_.setAttribute('aria-expanded', false);
  }
};
