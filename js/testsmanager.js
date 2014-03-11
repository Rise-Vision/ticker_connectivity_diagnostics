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
goog.require('ccd.ChromeInternetDisconnectedTest');
goog.require('ccd.ChromeOSInternetDisconnectedTest');
goog.require('ccd.ChromeOSVersionTest');
goog.require('ccd.ChromeVersionTest');
goog.require('ccd.HttpLatencyTest');
goog.require('ccd.ResolverLatencyTest');
goog.require('ccd.ResolverPresentTest');
goog.require('ccd.TcpFirewallTest');
goog.require('ccd.StunTest');
goog.require('ccd.TestId');
goog.require('ccd.TestResults');
goog.require('ccd.metrics');
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
};


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

  this.testResults_.addTestResult(testResult);
  if (testResult.getTestId() == ccd.TestId.INTERNET_DISCONNECTED &&
      testResult.getTestVerdict() == ccd.TestVerdict.PROBLEM) {
    // Since the internet is disconnected, do not bother running
    //   other tests.
    this.testsCanceled_ = true;
    this.testsCompletedCallbackFnc_(this.testResults_);
  }

  this.nextTestToRun_++;
  if (!this.testsCanceled_) {
    this.runTests();
  }
};


/**
 * Run a series of tests to pinpoint connectivity issues.
 */
ccd.TestsManager.prototype.runTests = function() {
  this.testsCanceled_ = false;

  // Compute the percent of the tests that have been run and pass this
  //   information back to the GUI to inform the user of the progress.
  var percentComplete = this.nextTestToRun_ / Object.keys(ccd.TestId).length;
  percentComplete *= 100;
  percentComplete = Math.round(percentComplete);
  this.progressCallbackFnc_(percentComplete);

  var boundCallback = this.testCallback.bind(this);
  this.timeLastTestBegan_ = (new Date).getTime();

  switch (this.nextTestToRun_) {
    case ccd.TestId.INTERNET_DISCONNECTED:
      if (ccd.util.isChromeOS() &&
          chrome.networkingPrivate != undefined) {
        var chromeOSDisconnectedTest =
            new ccd.ChromeOSInternetDisconnectedTest();
        chromeOSDisconnectedTest.runTest(boundCallback);
      } else {
        var chromeDisconnectedTest =
            new ccd.ChromeInternetDisconnectedTest();
        chromeDisconnectedTest.runTest(boundCallback);
      }
      break;
    case ccd.TestId.CHROME_VERSION:
      var chromeVersionTest = new ccd.ChromeVersionTest();
      chromeVersionTest.runTest(boundCallback);
      break;
    case ccd.TestId.CHROMEOS_VERSION:
      if (ccd.util.isChromeOS()) {
        var chromeOSVersionTest = new ccd.ChromeOSVersionTest();
        chromeOSVersionTest.runTest(boundCallback);
      } else {
        this.nextTestToRun_++;
        this.runTests();
      }
      break;
    case ccd.TestId.DNS_RESOLVER_PRESENT:
      var resolverPresentTest = new ccd.ResolverPresentTest();
      resolverPresentTest.runTest(boundCallback);
      break;
    case ccd.TestId.CAPTIVE_PORTAL_DNS:
      var captivePortalDnsTest = new ccd.CaptivePortalDnsTest();
      captivePortalDnsTest.runTest(boundCallback);
      break;
    case ccd.TestId.CAPTIVE_PORTAL_HTTP:
      var captivePortalHttpTest = new ccd.CaptivePortalHttpTest();
      captivePortalHttpTest.runTest(boundCallback);
      break;
    case ccd.TestId.FIREWALL_80:
      var firewallTest = new ccd.TcpFirewallTest(80, ccd.TestId.FIREWALL_80);
      firewallTest.runTest(boundCallback);
      break;
    case ccd.TestId.FIREWALL_443:
      var firewallTest = new ccd.TcpFirewallTest(443, ccd.TestId.FIREWALL_443);
      firewallTest.runTest(boundCallback);
      break;
    case ccd.TestId.RESOLVER_LATENCY:
      var resolverLatencyTest = new ccd.ResolverLatencyTest();
      resolverLatencyTest.runTest(boundCallback);
      break;
    case ccd.TestId.HTTP_LATENCY:
      var httpLatencyTest = new ccd.HttpLatencyTest();
      httpLatencyTest.runTest(boundCallback);
      break;
    case ccd.TestId.CONNECTIFY_STUN:
      console.log("About to run STUN test!");
      var stunTest = new ccd.StunTest();
      stunTest.runTest(boundCallback);
      break;
    default:
      // All tests run, invoke callback function.
      this.testsCompletedCallbackFnc_(this.testResults_);
  }
};


/**
 * Cancel all running tests and do not make any callbacks.
 */
ccd.TestsManager.prototype.cancelTests = function() {
  this.testsCanceled_ = true;
};
