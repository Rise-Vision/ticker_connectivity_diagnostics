// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test the latency of HTTP requests.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.HttpLatencyTest');

goog.require('ccd.Test');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');
goog.require('ccd.metrics');



/**
 * Test for HTTP latency.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.HttpLatencyTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.HTTP_LATENCY);

  /**
   * @private {number}
   */
  this.numTestsCompleted_ = 0;


  /**
   * @private {number}
   */
  this.totalTimeToRespond_ = 0;

  /**
   * @private {number}
   */
  this.timeoutId_ = 0;

  /**
   * @private {number}
   */
  this.testStartMilsec_ = 0;

  /**
   * Hostnames to query in an attempt to determine HTTP latency.
   * @private {!Array.<string>}
   */
  this.hostnamesToQuery_ = [];
  for (var i = 0; i < 3; i++) {
    this.hostnamesToQuery_.push(
        ccd.util.getRandomString(8) + '-ccd-testing-v4.metric.gstatic.com');
  }
};


/** @type {ccd.Test} */
ccd.HttpLatencyTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.HttpLatencyTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.HttpLatencyTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * @private {number}
 * @const
 */
ccd.HttpLatencyTest.XHR_SLEEP_MILSEC_ = 2000;


/**
 * @private {number}
 * @const
 */
ccd.HttpLatencyTest.NO_PROBLEM_LATENCY_MILSEC_ = 400;


/**
 * @private {number}
 * @const
 */
ccd.HttpLatencyTest.POTENTIAL_PROBLEM_LATENCY_MILSEC_ = 500;


/**
 * @override
 */
ccd.HttpLatencyTest.prototype.analyzeResults = function() {
  var avgTime = this.totalTimeToRespond_ / this.hostnamesToQuery_.length;
  avgTime = Math.round(avgTime * 100) / 100;
  ccd.metrics.recordMediumTime('HTTP_LATENCY', avgTime);

  this.testResult.addLogRecord(
      chrome.i18n.getMessage('httplatencytest_log_response_time') +
      this.totalTimeToRespond_);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('httplatencytest_log_num_requests') +
      this.hostnamesToQuery_.length);
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('httplatencytest_log_average_time') + avgTime);

  if (avgTime < ccd.HttpLatencyTest.NO_PROBLEM_LATENCY_MILSEC_) {
    this.testResult.setTitle(
        chrome.i18n.getMessage('httplatencytest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('httplatencytest_noproblem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
  } else if (avgTime < ccd.HttpLatencyTest.POTENTIAL_PROBLEM_LATENCY_MILSEC_) {
    this.testResult.setTitle(
        chrome.i18n.getMessage('httplatencytest_potentialproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('httplatencytest_potentialproblem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.POTENTIAL_PROBLEM);
  } else {
    this.testResult.setTitle(
        chrome.i18n.getMessage('httplatencytest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage('httplatencytest_problem_subtitle'));
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
  }
};


/**
 * Receive the full response of the HTTP request.
 * @param {string} resultData The full content of the HTTP response, both
 *    headers and body.
 * @private
 */
ccd.HttpLatencyTest.prototype.responseReceived_ = function(resultData) {
  var currMilliseconds = (new Date).getTime();
  var millisecondsTaken = currMilliseconds - this.testStartMilsec_;
  this.totalTimeToRespond_ += millisecondsTaken;

  this.testResult.addLogRecord(
      chrome.i18n.getMessage('httplatencytest_log_response_details') +
      this.numTestsCompleted_ + ' / ' +
      currMilliseconds + ' / ' + millisecondsTaken);

  this.numTestsCompleted_++;
  window.clearTimeout(this.timeoutId_);
  if (this.numTestsCompleted_ < this.hostnamesToQuery_.length) {
    if (ccd.HttpLatencyTest.XHR_SLEEP_MILSEC_ > 0) {
      this.timeoutId_ = setTimeout(this.requestHostname_.bind(this),
                                   ccd.HttpLatencyTest.XHR_SLEEP_MILSEC_);
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
ccd.HttpLatencyTest.prototype.requestError_ = function(errorStatus) {
  this.testResult.addLogRecord(
      chrome.i18n.getMessage('httplatencytest_log_network_error') +
      this.numTestsCompleted_ + ' / ' + errorStatus);

  this.numTestsCompleted_++;
  window.clearTimeout(this.timeoutId_);
  this.testResult.setTestVerdict(ccd.TestVerdict.TEST_FAILURE_OCCURRED);
  this.executeCallback();
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
ccd.HttpLatencyTest.prototype.newTelnet_ = function(host,
                                                    port,
                                                    testResult) {
  return new ccd.Telnet(host, port, testResult);
};


/**
 * Make an HTTP request.
 * @private
 */
ccd.HttpLatencyTest.prototype.requestHostname_ = function() {
  this.testStartMilsec_ = (new Date).getTime();
  var reqNum = this.numTestsCompleted_;
  var socket = this.newTelnet_(this.hostnamesToQuery_[reqNum],
                               80, this.testResult);
  socket.setCompletedCallbackFnc(this.responseReceived_.bind(this));
  socket.setFailureCallbackFnc(this.requestError_.bind(this));
  socket.setPlainTextDataToSend('GET /generate_204 HTTP/1.1\n' +
      'Host: ' + this.hostnamesToQuery_[reqNum] + '\n' +
      'Connection: close\n' +
      'User-Agent: ' + ccd.util.getCcdUserAgent() + '\n' +
      '\n');
  socket.startConnection();
};


/**
 * @override
 */
ccd.HttpLatencyTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  this.requestHostname_();
};
