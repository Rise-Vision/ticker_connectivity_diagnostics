// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether Chrome version is up to date.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ChromeVersionTest');

goog.require('ccd.Test');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');



/**
 * Test the version of Chrome.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.ChromeVersionTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.CHROME_VERSION);

  /**
   * The browser version number.
   * @type {number}
   * @private
   */
  this.versionShort_ = 0;
};


/** @type {ccd.Test} */
ccd.ChromeVersionTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.ChromeVersionTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.ChromeVersionTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * The smallest permitted verion of Google Chrome.
 * @private {number}
 * @const
 */
ccd.ChromeVersionTest.SMALLEST_PERMITTED_CHROME_VERSION_NUM_ = 27;


/**
 * @override
 */
ccd.ChromeVersionTest.prototype.analyzeResults = function() {
  if (this.versionShort_ <
      ccd.ChromeVersionTest.SMALLEST_PERMITTED_CHROME_VERSION_NUM_) {
    this.testResult.setTitle(
        chrome.i18n.getMessage('chromeversiontest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('chromeversiontest_problem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
    this.testResult.addLogRecord('Chrome Version Test detected a problem. ' +
        'Chrome Version ' + this.versionShort_ + ' is too low. ' +
        'Minimum version is now ' +
        ccd.ChromeVersionTest.SMALLEST_PERMITTED_CHROME_VERSION_NUM_);
  } else {
    this.testResult.setTitle(
        chrome.i18n.getMessage('chromeversiontest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('chromeversiontest_noproblem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
    this.testResult.addLogRecord('Chrome Version Test did not detect a ' +
        'problem. Chrome Version ' + this.versionShort_ +
        ' is up to date. Minimum version is now ' +
        ccd.ChromeVersionTest.SMALLEST_PERMITTED_CHROME_VERSION_NUM_);
  }
};


/**
 * Return the browser's user-agent.
 * This is implemented for testing purposes.
 * @return {string} Browser's user-agent.
 * @private
 */
ccd.ChromeVersionTest.prototype.getUserAgent_ = function() {
  return navigator.userAgent;
};


/**
 * @override
 */
ccd.ChromeVersionTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;

  var userAgent = this.getUserAgent_();
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('chromeversiontest_raw_useragent') + userAgent);
  this.versionShort_ = this.getMajorVersionNum_(userAgent);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('chromeversiontest_short_browser') +
      this.versionShort_);
  var versionFull = this.getFullVersionNum_(userAgent);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('chromeversiontest_full_browser') +
      versionFull);

  this.analyzeResults();
  this.executeCallback();
};


/**
 * Accept the full user agent of the browser and return the short version
 *   number.
 * @param {string} userAgent HTTP User-Agent of the browser.
 * @return {number} the version number of Google Chrome on which this app is
 *    being run (e.g., return 27).
 * @private
 */
ccd.ChromeVersionTest.prototype.getMajorVersionNum_ = function(userAgent) {
  var searchFor = ' Chrome/';
  var pos = userAgent.indexOf(searchFor);
  if (pos == -1) {
    return -1;
  }

  var trimmed = userAgent.substr((pos + searchFor.length), 5);
  var versionPosEnd = trimmed.indexOf('.');
  var version = parseInt(trimmed.substr(0, versionPosEnd), 10);
  return version;
};


/**
 * Accept the full user agent of the browser and return the full version
 *   number.
 * @param {string} userAgent HTTP User-Agent of the browser.
 * @return {string} the full version number of Google Chrome on which this
 *    app is being run (e.g., return '27.0.1453.110').
 * @private
 */
ccd.ChromeVersionTest.prototype.getFullVersionNum_ = function(userAgent) {
  var searchFor = ' Chrome/';
  var pos = userAgent.indexOf(searchFor);
  if (pos == -1) {
    return '-1';
  }

  var trimmed = userAgent.substr((pos + searchFor.length));
  var versionPosEnd = trimmed.indexOf(' ');
  var version = trimmed.substr(0, versionPosEnd);
  return version;
};
