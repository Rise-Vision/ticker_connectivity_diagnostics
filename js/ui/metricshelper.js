// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Singleton to keep track of UI state variables and perform
 *    associated non-GUI actions such as recording metrics. This code is
 *    not designed to perform any UI actions/manipulations.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ui.MetricsHelper');

goog.require('ccd.metrics');



/**
 * @constructor
 */
ccd.ui.MetricsHelper = function() {
  /** @private {boolean} */
  this.settingsShown_ = false;

  /** @private {boolean} */
  this.logsShown_ = false;

  /** @private {boolean} */
  this.passingTestsShown_ = false;

  /** @private {boolean} */
  this.expandedTestResult_ = false;
};


/** @private {ccd.ui.MetricsHelper} */
ccd.ui.MetricsHelper.instance_ = null;


/**
 * Get singleton instance of object.
 * @return {!ccd.ui.MetricsHelper} Return singleton instance.
 */
ccd.ui.MetricsHelper.getInstance = function() {
  if (!ccd.ui.MetricsHelper.instance_) {
    ccd.ui.MetricsHelper.instance_ = new ccd.ui.MetricsHelper();
  }
  return ccd.ui.MetricsHelper.instance_;
};


/**
 * Record that the settings menu has been shown to the end-user.
 */
ccd.ui.MetricsHelper.prototype.settingsShown = function() {
  if (!this.settingsShown_) {
    ccd.metrics.recordUserAction('SettingsShown');
    this.settingsShown_ = true;
  }
};


/**
 * Record that the user clicked on show passing tests.
 */
ccd.ui.MetricsHelper.prototype.passingTestsShown = function() {
  if (!this.passingTestsShown_) {
    ccd.metrics.recordUserAction('PassingTestsShown');
    this.passingTestsShown_ = true;
  }
};


/**
 * Record that the user clicked on expand test results.
 */
ccd.ui.MetricsHelper.prototype.expandTestResult = function() {
  if (!this.expandedTestResult_) {
    ccd.metrics.recordUserAction('TestResultExpanded');
    this.expandedTestResult_ = true;
  }
};


/**
 * Record that the user clicked on show logs.
 */
ccd.ui.MetricsHelper.prototype.logsShown = function() {
  if (!this.logsShown_) {
    ccd.metrics.recordUserAction('LogsShown');
    this.logsShown_ = true;
  }
};
