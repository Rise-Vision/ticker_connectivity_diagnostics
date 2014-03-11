// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether ChromeOS version is up to date.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ChromeOSVersionTest');


goog.require('ccd.Test');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');
goog.require('ccd.flags');



/**
 * Test the version of ChromeOS.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.ChromeOSVersionTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.CHROMEOS_VERSION);

  /**
   * @private {number}
   */
  this.shortPlatformNumber_ = 0;
};


/** @type {ccd.Test} */
ccd.ChromeOSVersionTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.ChromeOSVersionTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.ChromeOSVersionTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * The smallest permitted version of ChromeOS.
 * @type {number}
 * @const
 */
ccd.ChromeOSVersionTest.SMALLEST_PERMITTED_CHROMEOS_PLATFORM_NUM = 4319;


/**
 * The smallest permitted version of ChromeOS.
 * @private {number}
 * @const
 */
ccd.ChromeOSVersionTest.UNABLE_TO_PARSE_PLATFORM_NUM_ = -1;


/**
 * Return the browser's user-agent.
 * This is implemented for testing purposes.
 * @return {string} Browser's user-agent.
 * @private
 */
ccd.ChromeOSVersionTest.prototype.getUserAgent_ = function() {
  return navigator.userAgent;
};


/**
 * Analyze the test results.
 * @override
 */
ccd.ChromeOSVersionTest.prototype.analyzeResults = function() {
  if (this.shortPlatformNumber_ ==
      ccd.ChromeOSVersionTest.UNABLE_TO_PARSE_PLATFORM_NUM_) {
    this.testResult.setTestVerdict(ccd.TestVerdict.TEST_NOT_RUN);
  } else if (this.shortPlatformNumber_ <
      ccd.ChromeOSVersionTest.SMALLEST_PERMITTED_CHROMEOS_PLATFORM_NUM) {
    this.testResult.setTitle(
        chrome.i18n.getMessage('chromeosversiontest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('chromeosversiontest_problem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('chromeosversiontest_problem_record_log') +
        ccd.ChromeOSVersionTest.SMALLEST_PERMITTED_CHROMEOS_PLATFORM_NUM);
  } else {
    this.testResult.setTitle(
        chrome.i18n.getMessage('chromeosversiontest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('chromeosversiontest_noproblem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
    this.testResult.addLogRecord(
        chrome.i18n.getMessage('chromeosversiontest_noproblem_record_log') +
        ccd.ChromeOSVersionTest.SMALLEST_PERMITTED_CHROMEOS_PLATFORM_NUM);
  }
};


/** @override */
ccd.ChromeOSVersionTest.prototype.canRun = function() {
  return (ccd.util.isChromeOS() &&
          ccd.flags.RUN_TEST_CHROMEOS_VERSION === true);
};


/**
 * @override
 */
ccd.ChromeOSVersionTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  var userAgent = this.getUserAgent_();
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('chromeosversiontest_raw_useragent') + userAgent);

  var fullPlatformNumber = this.getFullPlatformNum_(userAgent);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('chromeosversiontest_full_platform') +
      fullPlatformNumber);

  this.shortPlatformNumber_ = this.getShortPlatformNum_(userAgent);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('chromeosversiontest_short_platform') +
      this.shortPlatformNumber_);

  this.analyzeResults();

  this.executeCallback();
};


/**
 * Perform a regular expression match against a string, looking for ChromeOS
 *   data in a HTTP user-agent.
 * @param {string} str String to match regex against.
 * @return {Array.<string>} Array of information on regex match.
 * @private
 */
ccd.ChromeOSVersionTest.prototype.getFullPlatformNumArr_ = function(str) {
  return str.match(/CrOS (x86_46|i686|i686 \(x86_64\))+ ([0-9\.]+)\)/i);
};


/**
 * Take the full user agent and return the full platform number of ChromeOS.
 * @param {string} userAgent Browser's user agent string.
 * @return {string} Full ChromeOS number (e.g., "3912.23.0").
 * @private
 */
ccd.ChromeOSVersionTest.prototype.getFullPlatformNum_ = function(userAgent) {
  var fullPlatformNumArr = this.getFullPlatformNumArr_(userAgent);
  if (fullPlatformNumArr == null || fullPlatformNumArr.length != 3) {
    return '' + ccd.ChromeOSVersionTest.UNABLE_TO_PARSE_PLATFORM_NUM_;
  }

  var fullPlatformNum = /** @type {string} */ (fullPlatformNumArr[2]);
  return fullPlatformNum;
};


/**
 * @param {string} userAgent Browser's user agent string.
 * @return {number} Short ChromeOS version number (e.g., 3912).
 * @private
 */
ccd.ChromeOSVersionTest.prototype.getShortPlatformNum_ = function(userAgent) {
  var fullPlatformNumArr = this.getFullPlatformNumArr_(userAgent);
  if (fullPlatformNumArr == null || fullPlatformNumArr.length != 3) {
    return ccd.ChromeOSVersionTest.UNABLE_TO_PARSE_PLATFORM_NUM_;
  }

  var fullPlatformNum = fullPlatformNumArr[2];
  var shortPlatformNum = fullPlatformNum.substr(0,
                                                fullPlatformNum.indexOf('.'));
  return parseInt(shortPlatformNum, 10);
};
