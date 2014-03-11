// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Abstract class to model functionality common to all tests.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.Test');



/**
 * Abstract class to model functionality common to all tests.
 * @constructor
 */
ccd.Test = function() {
  /**
   * Object to capture test results
   * @protected {ccd.TestResult}
   */
  this.testResult = null;

  /**
   * Function to execute upon completing this test.
   * @protected {?function(ccd.TestResult)}
   */
  this.callbackFnc = null;
};


/**
 * Analyze the data gathered by the test.
 * @protected
 */
ccd.Test.prototype.analyzeResults = goog.abstractMethod;


/**
 * Execute the callback function to be run upon completion of the test.
 * @protected
 */
ccd.Test.prototype.executeCallback = function() {
  this.callbackFnc(this.testResult);
};


/**
 * Executes the test. Overridden in subclasses to actually execute the test.
 * @param {function(ccd.TestResult)} callbackFnc
 *   Function to execute upon completion of test.
 */
ccd.Test.prototype.runTest = goog.abstractMethod;
