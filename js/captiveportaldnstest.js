// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether a captive portal is present and implemented
 *   via DNS.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.CaptivePortalDnsTest');

goog.require('ccd.Test');
goog.require('ccd.TestConfVars');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');



/**
 * Test whether a captive portal is present and implemented by DNS.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.CaptivePortalDnsTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.CAPTIVE_PORTAL_DNS);

  /**
   * The number of retries of a request remaining.
   * @private {number}
   */
  this.numRetriesRemaining_ = ccd.CaptivePortalDnsTest.NUM_QUERIES_TO_RETRY_;

  /**
   * The number of hostnames that have been tested to detemine whether a
   *   captive portal is present.
   * @private {number}
   */
  this.numTestsCompleted_ = 0;

  /**
   * Store address returned by DNS resolution.
   * @private {!Array.<string>}
   */
  this.resolutionResultsString_ = [];


  /**
   * Store DNS resolution status code.
   * @see #chromium/src/net/base/net_error_list.h
   * @private {!Array.<number>}
   */
  this.resolutionResultsCode_ = [];

  /**
   * @private {number}
   */
  this.timeoutId_ = 0;

  /**
   * @private {Array.<string>}
   * @const
   */
  this.knownHostnamesToQuery_ = ['ccd-testing-v4.gstatic.com'];
};


/** @type {ccd.Test} */
ccd.CaptivePortalDnsTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.CaptivePortalDnsTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.CaptivePortalDnsTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * @private {number}
 * @const
 */
ccd.CaptivePortalDnsTest.NUM_RANDOM_HOSTS_CAPTIVE_PORTAL_DNS_TEST_ = 0;


/**
 * @private {number}
 * @const
 */
ccd.CaptivePortalDnsTest.NUM_QUERIES_TO_RETRY_ = 3;


/**
 * @private {Array.<number>}
 * @const
 */
ccd.CaptivePortalDnsTest.RESPONSE_CODES_TO_RETRY_ = [-7, -803];


/**
 * Determine whether a DNS captive portal exists.
 * @return {boolean} Whether a DNS captive portal was detected.
 * @private
 */
ccd.CaptivePortalDnsTest.prototype.isProblemDetected_ = function() {
  // Check Google hosts.
  // Known Google host queries (i.e., queries to ccd-testing-v4.gstatic.com)
  //   should return 216.239.3{2,4,6,8}.21
  for (var i = 0; i < this.knownHostnamesToQuery_.length; i++) {
    if (this.resolutionResultsString_[i] != '216.239.32.21' &&
        this.resolutionResultsString_[i] != '216.239.34.21' &&
        this.resolutionResultsString_[i] != '216.239.36.21' &&
        this.resolutionResultsString_[i] != '216.239.38.21') {
      return true;
    }
  }
  return false;
};


/**
 * @override
 */
ccd.CaptivePortalDnsTest.prototype.analyzeResults = function() {
  if (this.isProblemDetected_()) {
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage('captiveportaldnstest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('captiveportaldnstest_problem_subtitle'));
  } else {
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage('captiveportaldnstest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('captiveportaldnstest_noproblem_subtitle'));
  }
};


/**
 * See chromium/src/chrome/common/extensions/api/experimental_dns.idl for
 *   the definition of ResolveCallbackResolveInfo.
 * @param {chrome.dns.ResolveCallbackResolveInfo} resolverResult
 *   DNS query results.
 * @private
 */
ccd.CaptivePortalDnsTest.prototype.resolveCallback_ = function(resolverResult) {
  window.clearTimeout(this.timeoutId_);
  if (resolverResult == undefined || resolverResult.resultCode == undefined) {
    // Resolution failed.
    this.testResult.addLogRecord('#' + this.numTestsCompleted_ +
        chrome.i18n.getMessage('captiveportaldnstest_noresult_code_returned'));
    this.testResult.setTestVerdict(ccd.TestVerdict.TEST_FAILURE_OCCURRED);
    this.executeCallback();
    return;
  } else if (ccd.CaptivePortalDnsTest.
          RESPONSE_CODES_TO_RETRY_.indexOf(resolverResult.resultCode) > -1 &&
      this.numRetriesRemaining_ > 0) {
    this.numTestsCompleted_--;
    this.numRetriesRemaining_--;
  } else {
    // Test succeeded (i.e., we got a result info we can analyze).
    this.resolutionResultsCode_.push(resolverResult.resultCode);
    this.testResult.addLogRecord('#' + this.numTestsCompleted_ +
        chrome.i18n.getMessage('captiveportaldnstest_log_statuscode_returned') +
        resolverResult.resultCode);

    // For some resolvers, resolverResult.address will be blank.
    // Check for this situation.
    if (resolverResult.address != undefined) {
      this.resolutionResultsString_.push(resolverResult.address);
      this.testResult.addLogRecord('#' + this.numTestsCompleted_ +
          chrome.i18n.getMessage('captiveportaldnstest_log_address_returned') +
          resolverResult.address);
    } else {
      // Need to push null in order to guarantee the array contains
      //   the proper number of elements, which preserves indexing.
      this.resolutionResultsString_.push(null);
      this.testResult.addLogRecord('#' + this.numTestsCompleted_ +
          chrome.i18n.getMessage('captiveportaldnstest_no_addr_returned'));
    }
  }

  this.numTestsCompleted_++;

  // Compute the total number of DNS resolution tests to run.
  var numTotalTestsToRun =
      ccd.CaptivePortalDnsTest.NUM_RANDOM_HOSTS_CAPTIVE_PORTAL_DNS_TEST_ +
      this.knownHostnamesToQuery_.length;
  if (this.numTestsCompleted_ >= numTotalTestsToRun) {
    this.analyzeResults();
    this.executeCallback();
  } else {
    // Allow code to be run synchronously to make testing easier.
    if (ccd.TestConfVars.RESOLVER_LATENCY_SLEEP_MILSEC > 0) {
      this.timeoutId_ = setTimeout(this.attemptResolution_.bind(this),
          ccd.TestConfVars.RESOLVER_LATENCY_SLEEP_MILSEC);
    } else {
      this.attemptResolution_();
    }
  }
};


/**
 * Attempt to resolve DNS for a hostname.
 * @private
 */
ccd.CaptivePortalDnsTest.prototype.attemptResolution_ = function() {
  var hostname = '';
  if (this.numTestsCompleted_ < this.knownHostnamesToQuery_.length) {
    hostname = this.knownHostnamesToQuery_[this.numTestsCompleted_];
  } else {
    hostname = ccd.util.getRandomString(25);
    hostname += '.com';
  }
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('captiveportaldnstest_beginning_resolution') +
      this.numTestsCompleted_ + ' / ' + hostname);

  if (typeof(chrome.dns) !== 'undefined') {
    chrome.dns.resolve(hostname, this.resolveCallback_.bind(this));
  }
};


/**
 * Test for a DNS-based captive portal.
 * @param {function(ccd.TestResult)} callbackFnc
 *   Function to execute upon completion of test.
 */
ccd.CaptivePortalDnsTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  this.attemptResolution_();
};
