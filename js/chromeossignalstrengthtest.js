// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Test ChromeOS NIC signal strength.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ChromeOSSignalStrengthTest');

goog.require('ccd.Test');
goog.require('ccd.TestId');
goog.require('ccd.TestResult');
goog.require('ccd.TestVerdict');
goog.require('ccd.metrics');



/**
 * Test whether a captive portal is present and implemented by DNS.
 * @constructor
 * @extends {ccd.Test}
 */
ccd.ChromeOSSignalStrengthTest = function() {
  this.testResult = new ccd.TestResult(ccd.TestId.NIC_SIGNAL_STRENGTH);

  /**
   * The strength of the network connection.
   * @private {number}
   */
  this.signalStrength_ =
      ccd.ChromeOSSignalStrengthTest.UNKNOWN_SIGNAL_STRENGTH_;
};


/** @type {ccd.Test} */
ccd.ChromeOSSignalStrengthTest.prototype = new ccd.Test();


/** @type {function(new:ccd.Test)} */
ccd.ChromeOSSignalStrengthTest.prototype.constructor = ccd.Test;


/** @type {ccd.Test} */
ccd.ChromeOSSignalStrengthTest.prototype.parent =
    /** @type {ccd.Test} */ (ccd.Test.prototype);


/**
 * Constant to represent when we do not know the signal strength.
 * @private {number}
 * @const
 */
ccd.ChromeOSSignalStrengthTest.UNKNOWN_SIGNAL_STRENGTH_ = -1;


/**
 * Constant to represent point below which the NIC signal strength
 *   is so weak it is problematic.
 * Indicates the signal strength of the service. This is a
 *   normalized value between 0 and 100.
 * @see #chromeos_public/src/platform/shill/doc/service-api.txt&l=1289
 * @private {number}
 * @const
 */
ccd.ChromeOSSignalStrengthTest.SIGNAL_STRENGTH_PROBLEM_ = 20;


/** @override */
ccd.ChromeOSSignalStrengthTest.prototype.analyzeResults = function() {
  if (this.signalStrength_ <
      ccd.ChromeOSSignalStrengthTest.SIGNAL_STRENGTH_PROBLEM_ &&
      this.signalStrength_ !=
          ccd.ChromeOSSignalStrengthTest.UNKNOWN_SIGNAL_STRENGTH_) {
    this.testResult.setTestVerdict(ccd.TestVerdict.PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage(
            'chromeossignalstrengthtest_problem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage(
            'chromeossignalstrengthtest_problem_subtitle'));
  } else if (this.signalStrength_ !=
      ccd.ChromeOSSignalStrengthTest.UNKNOWN_SIGNAL_STRENGTH_) {
    this.testResult.setTestVerdict(ccd.TestVerdict.NO_PROBLEM);
    this.testResult.setTitle(
        chrome.i18n.getMessage(
            'chromeossignalstrengthtest_noproblem_title'));
    this.testResult.setSubtitle(
        chrome.i18n.getMessage(
            'chromeossignalstrengthtest_noproblem_subtitle'));
  } else {
    this.testResult.setTestVerdict(ccd.TestVerdict.TEST_NOT_RUN);
  }
};


/** @override */
ccd.ChromeOSSignalStrengthTest.prototype.runTest = function(callbackFnc) {
  this.callbackFnc = callbackFnc;
  chrome.networkingPrivate.getVisibleNetworks('All',
      this.processNicInfo_.bind(this));
};


/**
 * Process network interface information.
 * @param {Array.<chrome.networkingPrivate.NetworkProperties>} nicInfo
 *    Network interface information.
 * @private
 */
ccd.ChromeOSSignalStrengthTest.prototype.processNicInfo_ = function(nicInfo) {
  for (var i = 0; i < nicInfo.length; i++) {
    if (nicInfo[i].ConnectionState == 'Connected' &&
        nicInfo[i].WiFi != undefined) {
      this.testResult.addLogRecord(
          chrome.i18n.getMessage(
          'chromeossignalstrengthtest_log_signal_strength') +
          nicInfo[i].name + ' / ' + nicInfo[i].WiFi.SignalStrength);
      this.signalStrength_ = nicInfo[i].WiFi.SignalStrength;
      ccd.metrics.recordHistogramValue('ChromeOsSignalStrength',
          this.signalStrength_, 0, 100, 10);
      break;
    }
  }
  this.analyzeResults();
  this.executeCallback();
};
