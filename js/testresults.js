// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Container class to store instances of {ccd.TestResult} and
 *   provide the ability to get all test results by test verdict. For example,
 *   a client can ask for all tests that failed and an array is returned
 *   in O(1) time.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.TestResults');

goog.require('ccd.TestVerdict');



/**
 * Class to contain test results.
 * @constructor
 */
ccd.TestResults = function() {
  /**
   * Store test results based upon verdict from individual connectivity tests.
   * @private {Object.<!ccd.TestVerdict, !Array.<ccd.TestResult>>}
   */
  this.testResults_ = {};
  this.testResults_[ccd.TestVerdict.NO_PROBLEM] = [];
  this.testResults_[ccd.TestVerdict.POTENTIAL_PROBLEM] = [];
  this.testResults_[ccd.TestVerdict.PROBLEM] = [];
};


/**
 * Add a test result into the store of test results for retrieval later.
 * @param {ccd.TestResult} testResult Results of a test.
 */
ccd.TestResults.prototype.addTestResult = function(testResult) {
  switch (testResult.getTestVerdict()) {
    case ccd.TestVerdict.NO_PROBLEM:
      this.testResults_[ccd.TestVerdict.NO_PROBLEM].push(testResult);
      break;
    case ccd.TestVerdict.POTENTIAL_PROBLEM:
      this.testResults_[ccd.TestVerdict.POTENTIAL_PROBLEM].push(testResult);
      break;
    case ccd.TestVerdict.PROBLEM:
      this.testResults_[ccd.TestVerdict.PROBLEM].push(testResult);
      break;
  }
};


/**
 * Return an array of test results for a given test verdict. This function
 *   returns the array in O(1) time.
 * @param {ccd.TestVerdict} testVerdictType Desired test verdict to return
 *   matching tests.
 * @return {!Array.<ccd.TestResult>} Array of test results matching
 *   the supplied verdict type.
 */
ccd.TestResults.prototype.getTestResultsByVerdict = function(testVerdictType) {
  return this.testResults_[testVerdictType];
};
