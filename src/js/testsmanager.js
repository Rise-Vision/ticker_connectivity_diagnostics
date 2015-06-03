// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Manage various tests used to diagnose connectivity problems.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.TestsManager');


goog.require('ccd.CaptivePortalDnsTest');
goog.require('ccd.CaptivePortalHttpTest');
goog.require('ccd.ChromeOSSignalStrengthTest');
goog.require('ccd.ChromeOSVersionTest');
goog.require('ccd.ChromeVersionTest');
goog.require('ccd.HttpFirewallTest');
goog.require('ccd.HttpLatencyTest');
goog.require('ccd.HttpsFirewallTest');
goog.require('ccd.InternetDisconnectedTest');
goog.require('ccd.PingGatewayTest');
goog.require('ccd.ResolverLatencyTest');
goog.require('ccd.ResolverPresentTest');
goog.require('ccd.TcpFirewallTest');
//goog.require('ccd.StunTest');
goog.require('ccd.TestId');
goog.require('ccd.TestResults');
goog.require('ccd.metrics');
goog.require('ccd.service.FeedbackService');
goog.require('ccd.util');



/**
 * Manage the running of connectivity tests.
 * @param {function(ccd.TestResults)} finishedCallbackFnc
 *    Function to be executed when all tests finish.
 * @param {function(number, string=)} progressCallbackFnc
 *    Function to be executed when a single test is done to register the
 *    progress of the overall test suite.
 * @constructor
 */
ccd.TestsManager = function(finishedCallbackFnc, progressCallbackFnc) {
  /**
   * Object containing all the results for completed tests.
   * @private {!ccd.TestResults}
   */
  this.testResults_ = new ccd.TestResults();

  /**
   * The number of the next test case to run.
   * @private {!ccd.TestId}
   */
  this.nextTestToRun_ = ccd.TestId.INTERNET_DISCONNECTED;

  /**
   * Callback function to be invoked when the tests complete.
   * @private {?function(ccd.TestResults)}
   */
  this.testsCompletedCallbackFnc_ = finishedCallbackFnc;

  /**
   * Callback function to be invoked when a single test is complete and progress
   *   should be reported.
   * @private {?function(number, string=)}
   */
  this.progressCallbackFnc_ = progressCallbackFnc;

  /**
   * Whether the tests have been canceled.
   * @private {boolean}
   */
  this.testsCanceled_ = false;

  /**
   * Record the timestamp that the last test began. Used to compute how long
   *   a test takes.
   * @private {number}
   */
  this.timeLastTestBegan_ = 0;


  /**
   * @private {ccd.service.FeedbackService}
   */
  this.feedbackService_ = ccd.service.FeedbackService.getInstance();
};


/**
 * Maps test IDs to test constructors.
 * @private {!Object.<!ccd.TestId, !function(new: ccd.Test)>}
 * @const
 */
ccd.TestsManager.TEST_MAP_ = { };
ccd.TestsManager.TEST_MAP_[ccd.TestId.INTERNET_DISCONNECTED] =
    ccd.InternetDisconnectedTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.CHROME_VERSION] =
    ccd.ChromeVersionTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.CHROMEOS_VERSION] =
    ccd.ChromeOSVersionTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.DNS_RESOLVER_PRESENT] =
    ccd.ResolverPresentTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.CAPTIVE_PORTAL_DNS] =
    ccd.CaptivePortalDnsTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.CAPTIVE_PORTAL_HTTP] =
    ccd.CaptivePortalHttpTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.FIREWALL_80] =
    ccd.HttpFirewallTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.FIREWALL_443] =
    ccd.HttpsFirewallTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.RESOLVER_LATENCY] =
    ccd.ResolverLatencyTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.HTTP_LATENCY] =
    ccd.HttpLatencyTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.NIC_SIGNAL_STRENGTH] =
    ccd.ChromeOSSignalStrengthTest;
ccd.TestsManager.TEST_MAP_[ccd.TestId.PING_GATEWAY] =
    ccd.PingGatewayTest;
//ccd.TestsManager.TEST_MAP_[ccd.TestId.CONNECTIFY_STUN] =
//    ccd.StunTest;


/**
 * Accept a test result from and add it to
 *   the repository of test results.
 * @param {ccd.TestResult} testResult Results of connectivity test.
 */
ccd.TestsManager.prototype.testCallback = function(testResult) {
  ccd.metrics.recordTestVerdict(testResult.getTestId(),
      testResult.getTestVerdict());

  var currMilliseconds = (new Date).getTime();
  var millisecondsTaken = currMilliseconds - this.timeLastTestBegan_;
  ccd.metrics.recordTestTimeTaken(testResult.getTestId(), millisecondsTaken);

  this.feedbackService_.saveTestResult(testResult.getTestId(),
                                       testResult.getTestVerdict(),
                                       millisecondsTaken);

  this.testResults_.addTestResult(testResult);
  if ((testResult.getTestId() === ccd.TestId.INTERNET_DISCONNECTED &&
      testResult.getTestVerdict() === ccd.TestVerdict.PROBLEM) ||
      (testResult.getTestId() === ccd.TestId.DNS_RESOLVER_PRESENT &&
      testResult.getTestVerdict() === ccd.TestVerdict.PROBLEM)) {
    // Since the internet is disconnected or there is no DNS resolver,
    //   do not bother running other tests.
    this.testsCanceled_ = true;
    this.testsCompletedCallbackFnc_(this.testResults_);
  }

  this.nextTestToRun_++;
  if (!this.testsCanceled_) {
    this.runRemainingTests();
  }
};


/**
 * Run a series of tests to pinpoint connectivity issues.
 */
ccd.TestsManager.prototype.runRemainingTests = function() {
  this.testsCanceled_ = false;

  // Compute the percent of the tests that have been run and pass this
  //   information back to the GUI to inform the user of the progress.
  var percentComplete = this.nextTestToRun_ / Object.keys(ccd.TestId).length;
  percentComplete *= 100;
  percentComplete = Math.round(percentComplete);
  this.progressCallbackFnc_(percentComplete);

  var boundCallback = this.testCallback.bind(this);
  if (this.nextTestToRun_ >= Object.keys(ccd.TestId).length ||
      this.nextTestToRun_ >= Object.keys(ccd.TestsManager.TEST_MAP_).length) {
    this.testsCompletedCallbackFnc_(this.testResults_);
    return;
  } else {
    var testConstructor = ccd.TestsManager.TEST_MAP_[this.nextTestToRun_];
    var test = new testConstructor();
    if (test.canRun()) {
      this.timeLastTestBegan_ = (new Date).getTime();
      test.runTest(boundCallback);
    } else {
      this.nextTestToRun_++;
      this.runRemainingTests();
    }
  }
};


/**
 * Cancel all running tests and do not make any callbacks.
 */
ccd.TestsManager.prototype.cancelTests = function() {
  this.testsCanceled_ = true;
};
