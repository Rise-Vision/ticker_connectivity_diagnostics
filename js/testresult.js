// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Store information about a test result.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.TestResult');


goog.require('ccd.TestVerdict');
goog.require('ccd.util');



/**
 * Store information about the results of a test.
 * @param {ccd.TestId} testId The ID of the test.
 * @constructor
 */
ccd.TestResult = function(testId) {
  this.testId_ = testId;

  /**
   * Array of log entries from the test's results and process.
   * @type {!Array.<string>}
   * @private
   */
  this.logs_ = [];

  /**
   * The ID of the test for which information is being stored.
   * @type {!ccd.TestId}
   * @private
   */
  this.testId_ = testId;

  /**
   * The verdict of the test (i.e., whether it found a problem or not).
   * @type {ccd.TestVerdict}
   * @private
   */
  this.testVerdict_ = ccd.TestVerdict.TEST_NOT_RUN;

  /**
   * The subtitle of the test result.
   * @type {!string}
   * @private
   */
  this.subtitle_ = '';

  /**
   * The title of the test result.
   * @type {!string}
   * @private
   */
  this.title_ = '';
};


/**
 * Set the title of the test result.
 * @param {string} title Test title.
 */
ccd.TestResult.prototype.setTitle = function(title) {
  this.title_ = title;
};


/**
 * Set the subtitle of the test result.
 * @param {string} subtitle Test subtitle.
 */
ccd.TestResult.prototype.setSubtitle = function(subtitle) {
  this.subtitle_ = subtitle;
};


/**
 * Return the title of the test result.
 * @return {string} Test title.
 */
ccd.TestResult.prototype.getTitle = function() {
  return this.title_;
};


/**
 * Return the subtitle of the test result.
 * @return {string} Test subtitle.
 */
ccd.TestResult.prototype.getSubtitle = function() {
  return this.subtitle_;
};


/**
 * Return the verdict of the test.
 * @return {ccd.TestVerdict} Result of test (i.e., pass, fail, warning).
 */
ccd.TestResult.prototype.getTestVerdict = function() {
  return this.testVerdict_;
};


/**
 * Set the verdict of the test.
 * @param {ccd.TestVerdict} verdict Result of test (i.e., pass, fail, warning).
 */
ccd.TestResult.prototype.setTestVerdict = function(verdict) {
  this.testVerdict_ = verdict;
};


/**
 * Return the ID of the test.
 * @return {ccd.TestId} ID of the test.
 */
ccd.TestResult.prototype.getTestId = function() {
  return /** @type {ccd.TestId} */ (this.testId_);
};


/**
 * Return the logs for the test.
 * @return {Array.<string>} Test result logs.
 */
ccd.TestResult.prototype.getLogs = function() {
  return this.logs_;
};


/**
 * Record a new log entry for the executing test.
 * @param {string} msg Message to be recorded.
 */
ccd.TestResult.prototype.addLogRecord = function(msg) {
  var record = ccd.util.printMicroTimestamp((new Date()).getTime());
  record += ' - ' + msg;
  this.logs_.push(record);
};
