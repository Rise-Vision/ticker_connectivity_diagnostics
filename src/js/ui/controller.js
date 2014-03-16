// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Controller for the UI.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.Controller');

goog.require('ccd.TestConfVars');
goog.require('ccd.TestResult');
goog.require('ccd.TestResults');
goog.require('ccd.TestsManager');
goog.require('ccd.ui.HeaderComponent');
goog.require('ccd.ui.KeyboardFocusHandler');
goog.require('ccd.ui.NoProblemsResultComponent');
goog.require('ccd.ui.ResultsContainerComponent');
goog.require('ccd.ui.SpinnerComponent');
goog.require('ccd.ui.StateManager');



/**
 * @constructor
 */
ccd.ui.Controller = function() {
  /**
   * @private {ccd.ui.SpinnerComponent}
   */
  this.spinnerComponent_ = null;

  /**
   * @private {Element}
   */
  this.spinnerContainerElem_ = null;

  /**
   * ID of the window timeout for the entire test suite.
   * @private {number}
   */
  this.testsRunningTimeoutId_ = 0;

  /**
   * @private {Element}
   */
  this.pageBodyContainerElem_ = null;

  /**
   * @private {ccd.ui.StateManager}
   */
  this.guiStateManager_ = ccd.ui.StateManager.getInstance();
  this.guiStateManager_.addRerunTestsChangeCallback(
      this.launchTests.bind(this));
};


/**
 * Launch tests.
 */
ccd.ui.Controller.prototype.launchTests = function() {
  this.tearDownPage_();
  this.setUpPage_();

  var bodyContainer =
      /** @type {!Element} */ (document.getElementById('ccd-app'));

  this.spinnerComponent_ = new ccd.ui.SpinnerComponent();
  this.spinnerContainerElem_ = this.spinnerComponent_.render(bodyContainer);
  this.spinnerComponent_.displayProgress(0);

  // Set a timeout so that if the tests do not return by a specific time,
  //   the tests stop running.
  if (ccd.TestConfVars.TOTAL_TESTS_TIMEOUT_SEC > 0) {
    this.testsRunningTimeoutId_ = setTimeout(this.handleTestTimeout_.bind(this),
        1000 * ccd.TestConfVars.TOTAL_TESTS_TIMEOUT_SEC);
  }

  try {
    var testsManager = new ccd.TestsManager(this.displayResults_.bind(this),
                                              this.displayProgress_.bind(this));
    testsManager.runRemainingTests();
  } catch (err) {
    this.handleTestError_();
  }
};


/**
 * Setup the core components on the page.
 * @private
 */
ccd.ui.Controller.prototype.setUpPage_ = function() {
  var header = new ccd.ui.HeaderComponent();

  var bodyContainer =
      /** @type {!Element} */ (document.getElementById('ccd-app'));
  header.render(bodyContainer);

  this.pageBodyContainerElem_ = document.createElement('div');
  this.pageBodyContainerElem_.id = 'page-body-container';
  bodyContainer.appendChild(this.pageBodyContainerElem_);

  var focusHandler = ccd.ui.KeyboardFocusHandler.getInstance();
  focusHandler.attachFocusListeners();
};


/**
 * Tear down (i.e., whipe clean) the page.
 * @private
 */
ccd.ui.Controller.prototype.tearDownPage_ = function() {
  document.getElementById('ccd-app').innerHTML = '';
  this.pageBodyContainerElem_ = null;
  this.spinnerContainerElem_ = null;
  this.spinnerComponent_ = null;
};


/**
 * Callback function invoked to display the results of the tests run.
 * @param {ccd.TestResults} testResults Test results to display onto page.
 * @private
 */
ccd.ui.Controller.prototype.displayResults_ = function(testResults) {
  window.clearTimeout(this.testsRunningTimeoutId_);

  // Clear spinner from DOM.
  this.spinnerContainerElem_.parentNode.removeChild(this.spinnerContainerElem_);

  var numFailingTests =
      testResults.getTestResultsByVerdict(
          ccd.TestVerdict.PROBLEM).length;
  var numWarningTests =
      testResults.getTestResultsByVerdict(
          ccd.TestVerdict.POTENTIAL_PROBLEM).length;

  if (numFailingTests === 0 && numWarningTests === 0) {
    var noProblemsComponent = new ccd.ui.NoProblemsResultComponent();
    noProblemsComponent.render(
        /** @type {!Element} */ (this.pageBodyContainerElem_));
  }

  var resultsContainer = new ccd.ui.ResultsContainerComponent(testResults);
  resultsContainer.render(
      /** @type {!Element} */ (this.pageBodyContainerElem_));
};


/**
 * Callback function invoked to display progress in running tests.
 * @param {number} percentCompleted The percent complete (e.g., 20) that
 *   the test suite is.
 * @private
 */
ccd.ui.Controller.prototype.displayProgress_ = function(percentCompleted) {
  this.spinnerComponent_.displayProgress(percentCompleted);
};


/**
 * Handle that the test timed out.
 * @private
 */
ccd.ui.Controller.prototype.handleTestTimeout_ = function() {
  window.clearTimeout(this.testsRunningTimeoutId_);
  // TODO(ebeach): implement
};


/**
 * Handle that the test timed out.
 * @private
 */
ccd.ui.Controller.prototype.handleTestError_ = function() {
  window.clearTimeout(this.testsRunningTimeoutId_);
  // TODO(ebeach): implement
};
