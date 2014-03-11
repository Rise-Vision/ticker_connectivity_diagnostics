// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI component to render a test result log.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.TestResultLogs');

goog.require('ccd.TestVerdict');
goog.require('ccd.ui.MetricsHelper');



/**
 * @param {!ccd.TestResult} testResult Results of connectivity test.
 * @constructor
 * @implements {ccd.ui.Component}
 */
ccd.ui.TestResultLogs = function(testResult) {
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
   * @type {Element}
   * @private
   */
  this.innerLogsContainer_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.toggleLogsTitle_ = null;
};


/** @override */
ccd.ui.TestResultLogs.prototype.render = function(element) {
  var outerLogsContainer = document.createElement('div');

  // Create the DOM id for the inner container holding the logs
  var innerId = 'inner-logs-container-' + this.testResult_.getTestId();

  // Create "Show Logs" link.
  var logsTitleContainer = document.createElement('div');
  this.toggleLogsTitle_ = document.createElement('a');
  this.toggleLogsTitle_.innerHTML =
      chrome.i18n.getMessage('test_result_show_logs');
  this.toggleLogsTitle_.setAttribute('aria-expanded', 'false');
  this.toggleLogsTitle_.setAttribute('aria-controls', innerId);

  ccd.ui.globals.lastTabIndex++;
  this.toggleLogsTitle_.tabIndex = ccd.ui.globals.lastTabIndex;
  this.toggleLogsTitle_.className =
      'show-logs-link show-logs-link-a';
  this.toggleLogsTitle_.addEventListener('click',
      this.handleShowLogsClick_.bind(this, this.testResult_.getTestId()),
      false);
  this.toggleLogsTitle_.addEventListener('keyup',
      this.handleShowLogsClick_.bind(this, this.testResult_.getTestId()),
      false);
  logsTitleContainer.appendChild(this.toggleLogsTitle_);
  outerLogsContainer.appendChild(logsTitleContainer);

  // Create a container around the actual logs. Used for show/hide.
  this.innerLogsContainer_ = document.createElement('div');
  this.innerLogsContainer_.id = innerId;
  this.innerLogsContainer_.className = ccd.ui.globals.Css.HIDDEN;
  var logs = document.createElement('textarea');

  ccd.ui.globals.lastTabIndex++;
  logs.tabIndex = ccd.ui.globals.lastTabIndex;
  logs.className = 'test-results-logs-textarea';
  logs.readOnly = true;
  logs.cols = 60;
  logs.rows = 10;

  var logStr = chrome.i18n.getMessage('test_result_log_test_id') +
      this.testResult_.getTestId() + '\n';
  logStr += chrome.i18n.getMessage('test_result_log_test_verdict');
  switch (this.testResult_.getTestVerdict()) {
    case ccd.TestVerdict.NO_PROBLEM:
      logStr +=
          chrome.i18n.getMessage('test_result_log_verdict_no_problem');
      break;
    case ccd.TestVerdict.PROBLEM:
      logStr +=
          chrome.i18n.getMessage('test_result_log_verdict_problem');
      break;
    case ccd.TestVerdict.POTENTIAL_PROBLEM:
      logStr +=
          chrome.i18n.getMessage('test_result_log_verdict_potential_problem');
      break;
    default:
      this.testResult_.getTestVerdict();
  }
  logStr += '\n';
  logStr += '\n';

  var testLogs = this.testResult_.getLogs();
  for (var i = 0; i < testLogs.length; i++) {
    logStr += testLogs[i] + '\n';
  }
  logs.value = logStr;
  this.innerLogsContainer_.appendChild(logs);

  outerLogsContainer.appendChild(this.innerLogsContainer_);
  element.appendChild(outerLogsContainer);

  return outerLogsContainer;
};


/**
 * Handle clicks on the "Show Logs" link.
 * @param {ccd.TestId} testId The ID of the test whose logs link is being
 *    toggled.
 * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.ui.TestResultLogs.prototype.handleShowLogsClick_ = function(testId, event) {
  if (event && event.type == 'keyup' &&
      event.keyCode !== ccd.ui.globals.KeyCode.ENTER) {
    // Key was pressed, but it is not Enter.
    return;
  }

  // Record that the user clicked on "Show Logs".
  this.uiMetricsHelper_.logsShown();

  if (this.innerLogsContainer_.className === ccd.ui.globals.Css.HIDDEN) {
    this.toggleLogsTitle_.innerHTML =
        chrome.i18n.getMessage('test_result_hide_logs');
    this.toggleLogsTitle_.setAttribute('aria-expanded', 'true');
    this.innerLogsContainer_.className = 'test-result-log-container';
  } else {
    this.toggleLogsTitle_.innerHTML =
        chrome.i18n.getMessage('test_result_show_logs');
    this.toggleLogsTitle_.setAttribute('aria-expanded', 'false');
    this.innerLogsContainer_.className = ccd.ui.globals.Css.HIDDEN;
  }

  // Due to tabIndex being present on a DIV or A, clicking on those elements
  //   will not release the :focus state, meaning there is still an outline.
  // Listen for clicks and release the :focus by bluring.
  // @see http://nemisj.com/focusable/
  // @see http://stackoverflow.com/questions/6203189/
  if (event && event.type == 'click') {
    this.toggleLogsTitle_.blur();
  }

  event.stopPropagation();
};
