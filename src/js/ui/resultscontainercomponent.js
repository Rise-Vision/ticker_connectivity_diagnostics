// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI component to page header.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.ResultsContainerComponent');

goog.require('ccd.TestResults');
goog.require('ccd.TestVerdict');
goog.require('ccd.ui.MetricsHelper');
goog.require('ccd.ui.StateManager');
goog.require('ccd.ui.TestResultsComponent');
goog.require('ccd.ui.globals');



/**
 * @param {ccd.TestResults} testResults Test results to display onto page.
 * @constructor
 * @implements {ccd.ui.Component}
 */
ccd.ui.ResultsContainerComponent = function(testResults) {
  /** @private @const */
  this.testResults_ = testResults;

  /**
   * @private {ccd.ui.MetricsHelper}
   */
  this.metricsHelper_ = ccd.ui.MetricsHelper.getInstance();

  /**
   * @private {ccd.ui.StateManager}
   */
  this.guiStateManager_ = ccd.ui.StateManager.getInstance();

  /**
   * @private {Element}
   */
  this.passingResultsElem_ = null;
};


/** @override */
ccd.ui.ResultsContainerComponent.prototype.render = function(element) {
  // Create a div representing the main component for all test results.
  var containerElement = document.createElement('div');
  containerElement.id = 'test-results-frame';
  containerElement.setAttribute('role', 'alert');

  var contentsElement = document.createElement('div');
  contentsElement.id = 'test-results-contents';

  // Create the test results containers and render them.
  var failingTests =
      this.testResults_.getTestResultsByVerdict(ccd.TestVerdict.PROBLEM);
  if (failingTests.length > 0) {
    var failingTestResultsContainer =
        new ccd.ui.TestResultsComponent('Failing Tests', failingTests);
    failingTestResultsContainer.render(contentsElement);
  }

  var warningTests =
      this.testResults_.getTestResultsByVerdict(
          ccd.TestVerdict.POTENTIAL_PROBLEM);
  if (warningTests.length > 0) {
    var warningTestResultsContainer =
        new ccd.ui.TestResultsComponent('Warning Tests', warningTests);
    warningTestResultsContainer.render(contentsElement);
  }

  var passedTests =
      this.testResults_.getTestResultsByVerdict(ccd.TestVerdict.NO_PROBLEM);
  if (passedTests.length > 0) {
    this.passingResultsElem_ = document.createElement('div');
    this.passingResultsElem_.id = ccd.ui.globals.DomIds.PASSING_TESTS_CONTAINER;
    this.passingResultsElem_.className = ccd.ui.globals.Css.HIDDEN;
    var passingTestResultsContainer =
        new ccd.ui.TestResultsComponent('Passing Tests', passedTests);
    passingTestResultsContainer.render(this.passingResultsElem_);
    contentsElement.appendChild(this.passingResultsElem_);
  }

  containerElement.appendChild(contentsElement);
  element.appendChild(containerElement);
  this.guiStateManager_.addPassingTestsChangeCallback(
      this.updatePassingTestsVisibility_.bind(this));
  this.updatePassingTestsVisibility_();

  return containerElement;
};


/**
 * Toggle whether passing tests are shown.
 * @private
 */
ccd.ui.ResultsContainerComponent.prototype.updatePassingTestsVisibility_ =
    function() {
  if (this.guiStateManager_.getPassingTestsVivibility()) {
    this.showPassingTests_();
  } else {
    this.hidePassingTests_();
  }
};


/**
 * Show the passing tests.
 * @private
 */
ccd.ui.ResultsContainerComponent.prototype.showPassingTests_ = function() {
  this.metricsHelper_.passingTestsShown();
  if (this.passingResultsElem_ != null) {
    this.passingResultsElem_.className = 'element-block';
  }
};


/**
 * Hide the passing tests.
 * @private
 */
ccd.ui.ResultsContainerComponent.prototype.hidePassingTests_ = function() {
  if (this.passingResultsElem_ != null) {
    this.passingResultsElem_.className = ccd.ui.globals.Css.HIDDEN;
  }
};
