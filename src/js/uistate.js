// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Singleton to keep track of UI state variables and perform
 *    associated non-GUI actions such as recording metrics. This code is
 *    not designed to perform any UI actions/manipulations.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.UiState');



goog.require('ccd.metrics');



/**
 * @constructor
 */
ccd.UiState = function() {
  /** @private {boolean} */
  this.settingsShown_ = false;

  /** @private {boolean} */
  this.logsShown_ = false;

  /** @private {boolean} */
  this.passingTestsShown_ = false;

  /** @private {boolean} */
  this.expandedTestResult_ = false;
};


/** @private {ccd.UiState} */
ccd.UiState.instance_ = null;


/**
 * Get singleton instance of ccd.UiState object.
 * @return {!ccd.UiState} Return singleton ccd.UiState instance.
 */
ccd.UiState.getInstance = function() {
  if (!ccd.UiState.instance_) {
    ccd.UiState.instance_ = new ccd.UiState();
  }
  return ccd.UiState.instance_;
};


/**
 * Record that the settings menu has been shown to the end-user.
 */
ccd.UiState.prototype.settingsShown = function() {
  if (!this.settingsShown_) {
    ccd.metrics.recordUserAction('SettingsShown');
    this.settingsShown_ = true;
  }
};


/**
 * Record that the user clicked on show passing tests.
 */
ccd.UiState.prototype.passingTestsShown = function() {
  if (!this.passingTestsShown_) {
    ccd.metrics.recordUserAction('PassingTestsShown');
    this.passingTestsShown_ = true;
  }
};


/**
 * Record that the user clicked on expand test results.
 */
ccd.UiState.prototype.expandTestResult = function() {
  if (!this.expandedTestResult_) {
    ccd.metrics.recordUserAction('TestResultExpanded');
    this.expandedTestResult_ = true;
  }
};


/**
 * Record that the user clicked on show logs.
 */
ccd.UiState.prototype.logsShown = function() {
  if (!this.logsShown_) {
    ccd.metrics.recordUserAction('LogsShown');
    this.logsShown_ = true;
  }
};
