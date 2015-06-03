// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test whether a captive portal is present and implemented
 *   via HTTP.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.CaptivePortalHttpTest');

goog.require('ccd.Telnet');
goog.require('ccd.Test');
goog.require('ccd.TestConfVars');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');



/**
 * Connectivity test for an HTTP-based captive portal.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.CaptivePortalHttpTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.CAPTIVE_PORTAL_HTTP);

  /**
   * Number of test HTTP requests completed.
   * @private {number}
   */
  this.numTestsCompleted_ = 0;

  /**
   * Length of HTTP response, body and headers, for each HTTP test.
   * @private {!Array.<number>}
   */
  this.fullResponseLength_ = [];

  /**
   * HTTP response status code (if HTTP request succeeds) or
   *    Chrome network stack error code (if no TCP socket throws an error)
   *    for each HTTP test.
   * @private {!Array.<number>}
   */
  this.responseCode_ = [];

  /**
   * ID of window timeout used to implement sleep between HTTP requests.
   * @private {number}
   */
  this.timeoutId_ = 0;

  /**
   * Hostnames to query in an attempt to determine whether an HTTP
   *   captive portal exists.
   * @private {Array.<string>}
   */
  this.hostnamesToQuery_ = [];
  this.hostnamesToQuery_.push('ticker.risedisplay.com');
  this.hostnamesToQuery_.push('s3.amazonaws.com');
  this.hostnamesToQuery_.push('contentfinancial2.appspot.com');
  this.hostnamesToQuery_.push('contentsports.appspot.com');
  this.hostnamesToQuery_.push('content-news.appspot.com');
  this.hostnamesToQuery_.push('connect.risevision.com');
  this.hostnamesToQuery_.push('54.172.249.25');
  
  this.hostnamesToQueryData_ = [];
  this.hostnamesToQueryData_.push('/generate_204');
  this.hostnamesToQueryData_.push('/risetickerapp/layouts/fullcolor/16h_financial_stacked_logos.xsl');
  this.hostnamesToQueryData_.push('/generate_204');
  this.hostnamesToQueryData_.push('/generate_204');
  this.hostnamesToQueryData_.push('/generate_204');
  this.hostnamesToQueryData_.push('/generate_204');
  this.hostnamesToQueryData_.push('/generate_204');
};


/** @type {ccd.Test} */
ccd.CaptivePortalHttpTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.CaptivePortalHttpTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.CaptivePortalHttpTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * Analyze the test results to determine whether a captive portal via HTTP
 *   is present.
 */
ccd.CaptivePortalHttpTest.prototype.analyzeResults = function() {
  // Start by assuming that there is no HTTP captive portal.
  this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);

  // Check whether Google's /generate_204 returns anything but a 204 status.
  // If so, there is probably a HTTP captive portal.
  var errorDetails = '';
  var numIssues = 0;
  for (var i = 0; i < this.hostnamesToQuery_.length; i++) {
    if (this.responseCode_[i] < 200 || this.responseCode_[i] >= 400) {
      numIssues++;
      errorDetails = errorDetails + '#' + i + " - Unable to connect to " + this.hostnamesToQuery_[i] + " on port 80\n" ;
    }
  }
  if(numIssues == 0) {
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
    this.testResult.setTitle(chrome.i18n.getMessage('captiveportalhttptest_noproblem_title'));
    this.testResult.setSubtitle(chrome.i18n.getMessage('captiveportalhttptest_noproblem_subtitle'));
  } else {
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
    this.testResult.setTitle(chrome.i18n.getMessage('captiveportalhttptest_problem_title'));
    this.testResult.setSubtitle(chrome.i18n.getMessage('captiveportalhttptest_problem_subtitle') + '\n\n' + errorDetails);
  }
  
  return;
};


/**
 * Extract the HTTP headers from a raw string.
 * @param {string} resultData The full content of the HTTP response, both
 *    headers and body.
 * @return {string} Raw string containing HTTP headers, including new lines
 *    but excluding the final double newline break.
 * @private
 */
ccd.CaptivePortalHttpTest.prototype.extractHeaders_ = function(resultData) {
  var endHeaderPos = resultData.indexOf('\n\n');
  if (endHeaderPos == -1) {
    return '-1';
  } else {
    return resultData.substr(0, endHeaderPos);
  }
};


/**
 * Extract the HTTP response status code from the raw HTTP response.
 * @param {string} resultData The full content of the HTTP response, both
 *    headers and body.
 * @return {number} The HTTP status code or -1 if it cannot be found in the
 *    supplied headers.
 * @private
 */
ccd.CaptivePortalHttpTest.prototype.extractStatusCode_ = function(resultData) {
  var newlinePos = resultData.indexOf('\n');
  if (newlinePos == -1 || resultData.substring(0, 9) != 'HTTP/1.1 ') {
    return -1;
  }
  var statusCode = resultData.substring(9, 12);
  return parseInt(statusCode, 10);
};


/**
 * Receive the full response of the HTTP request.
 * @param {string} resultData The full content of the HTTP response, both
 *    headers and body.
 * @private
 */
ccd.CaptivePortalHttpTest.prototype.responseReceived_ = function(resultData) {
  var responseHeaders = this.extractHeaders_(resultData);
  var responseStatusCode = this.extractStatusCode_(resultData);

  this.fullResponseLength_.push(resultData.length);
  this.responseCode_.push(responseStatusCode);

  this.testResult.addLogRecord(
      chrome.i18n.getMessage('captiveportalhttptest_log_response_length') +
      this.numTestsCompleted_ + ' / ' + resultData.length);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('captiveportalhttptest_log_response_code') +
      responseStatusCode);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('captiveportalhttptest_log_http_response') +
      responseHeaders);

  this.numTestsCompleted_++;
  window.clearTimeout(this.timeoutId_);
  if (this.numTestsCompleted_ < this.hostnamesToQuery_.length) {
    if (ccd.TestConfVars.XHR_SLEEP_MILSEC > 0) {
      this.timeoutId_ = setTimeout(this.requestHostname_.bind(this),
                                   ccd.TestConfVars.XHR_SLEEP_MILSEC);
    } else {
      this.requestHostname_();
    }
  } else {
    this.analyzeResults();
    this.executeCallback();
  }
};


/**
 * Handle a TCP socket error. This is not an HTTP error such as a 500
 *    server response.
 * @param {number} errorStatus The Chrome network error status code.
 * @see http://src.chromium.org/svn/trunk/src/net/base/net_error_list.h
 * @private
 */
ccd.CaptivePortalHttpTest.prototype.requestError_ = function(errorStatus) {
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('captiveportalhttptest_log_network_error') +
      this.numTestsCompleted_ + ' / ' + errorStatus);

  this.fullResponseLength_.push(null);
  this.responseCode_.push(errorStatus);
  this.numTestsCompleted_++;
  this.responseReceived_('');
};


/**
 * Return a new TCP socket.
 * Implemented for efficient testing.
 * @param {string} host Hostname to open a connection with.
 * @param {number} port Port number to connect on.
 * @param {ccd.TestResult} testResult Manage output logs.
 * @return {ccd.Telnet} New XHR object.
 * @private
 */
ccd.CaptivePortalHttpTest.prototype.newTelnet_ = function(host,
                                                          port,
                                                          testResult) {
  return new ccd.Telnet(host, port, testResult);
};


/**
 * Make an HTTP request.
 * @private
 */
ccd.CaptivePortalHttpTest.prototype.requestHostname_ = function() {
  var reqNum = this.numTestsCompleted_;
  var socket = this.newTelnet_(this.hostnamesToQuery_[reqNum],
                               80, this.testResult);
  socket.setCompletedCallbackFnc(this.responseReceived_.bind(this));
  socket.setFailureCallbackFnc(this.requestError_.bind(this));
  socket.setPlainTextDataToSend('GET ' + this.hostnamesToQueryData_[reqNum] + ' HTTP/1.1\n' +
      'Host: ' + this.hostnamesToQuery_[reqNum] + '\n' +
      'Connection: close\n' +
      'User-Agent: ' + ccd.util.getCcdUserAgent() + '\n' +
      '\n');
  socket.startConnection();
};


/**
 * Run the HTTP captive portal test.
 * @param {function(ccd.TestResult)} callbackFnc
 *   Function to execute upon completion of test.
 */
ccd.CaptivePortalHttpTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  this.requestHostname_();
};
