// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Construct and manage the GUI.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.GuiManager');

goog.require('ccd.TestVerdict');
goog.require('ccd.TestsManager');
goog.require('ccd.UiState');



/**
 * Construct and manage the GUI for the connectivity debugger.
 * @constructor
 */
ccd.GuiManager = function() {
  /**
   * The DOM-id of the div that stores the frame for all the test results.
   * @private {string}
   */
  this.testsResultsFrameId_ = 'test-results-frame';

  /**
   * The DOM-id of the div that stores the contents for all the test results.
   * @private {string}
   */
  this.testsResultsContentsId_ = 'test-results-contents';

  /**
   * The DOM-id of the div that stores the frame for passing test results.
   * @private {string}
   */
  this.testsResultsPassingFrameId_ = 'results-passing-frame';

  /**
   * The DOM-id of the div that stores the frame for failing test results.
   * @private {string}
   */
  this.testsResultsFailingFrameId_ = 'results-failing-frame';

  /**
   * The DOM-id of the div that stores the frame for warning test results.
   * @private {string}
   */
  this.testsResultsWarningFrameId_ = 'results-warning-frame';

  /**
   * The DOM-id of the div that stores the settings.
   * @private {string}
   */
  this.settingsDomId_ = 'settings-container';

  /**
   * The DOM-id of the div that stores the link to toggle whether to show
   *   passing tests.
   * @private {string}
   */
  this.togglePassingTestsLinkDomId_ = 'toggle-passing-tests-link';

  /**
   * The DOM-id of the div that contains the contents of the page (i.e.
   *   the part that is not the top header)
   * @private {string}
   */
  this.pageBodyContainerDomId_ = 'page-body-container';

  /**
   * The DOM-id of the element that displays the percent update for the
   *   spinner.
   * @private {string}
   */
  this.spinnerProgressContentsDomId_ = 'page-body-spinner-progress-content';

  /**
   * ID of the window timeout for the entire test suite.
   * @private {number}
   */
  this.testsRunningTimeoutId_ = 0;

  /**
   * Manage the various connectivity tests.
   * @private {ccd.TestsManager}
   */
  this.testsManager_ = null;

  /**
   * Store results from tests.
   * @private {ccd.TestResults}
   */
  this.finishedTestResults_ = null;

  /**
   * Whether to display passing tests results.
   * @private {boolean}
   */
  this.showPassingTestsResults_ = false;

  /**
   * Whether to show settings in the upper right.
   * @private {boolean}
   */
  this.showSettings_ = false;

  /**
   * @private {ccd.UiState}
   */
  this.uiState_ = ccd.UiState.getInstance();
};


/**
 * Construct the test-results-frame for a specific test result.
 * This will construct a div to encapsulate all information for printing
 *   the resutls of a given test.
 * @param {ccd.TestResult} testResult Results from test to be framed.
 * @private
 */
ccd.GuiManager.prototype.paintTestResultFrame_ = function(testResult) {
  var testResultFrameId = 'test-result-frame-' + testResult.getTestId();
  if (document.getElementById(testResultFrameId) != undefined) return;

  var parentElementId = '';
  switch (testResult.getTestVerdict()) {
    case ccd.TestVerdict.NO_PROBLEM:
      parentElementId = this.testsResultsPassingFrameId_;
      break;
    case ccd.TestVerdict.POTENTIAL_PROBLEM:
      parentElementId = this.testsResultsWarningFrameId_;
      break;
    case ccd.TestVerdict.PROBLEM:
      parentElementId = this.testsResultsFailingFrameId_;
      break;
  }

  var resultFrame = document.createElement('div');
  resultFrame.id = testResultFrameId;
  resultFrame.className = 'test-results-contents-frame';

  document.getElementById(parentElementId).appendChild(resultFrame);
};


/**
 * Handle clicks on the "Show Logs" link.
 * @param {ccd.TestId} testId The ID of the test whose logs link is being
 *    toggled.
 * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.GuiManager.prototype.handleShowLogsClick_ = function(testId, event) {
  this.uiState_.logsShown();
  var logContainer = document.getElementById(
      'log-container-' + testId);
  var showLogsLink = document.getElementById(
      'show-logs-link-' + testId);
  if (logContainer.className == 'element-hidden') {
    showLogsLink.innerHTML = chrome.i18n.getMessage('test_result_hide_logs');
    logContainer.className = 'test-result-log-container';
  } else {
    showLogsLink.innerHTML = chrome.i18n.getMessage('test_result_show_logs');
    logContainer.className = 'element-hidden';
  }
  event.stopPropagation();
};


/**
 * @param {ccd.TestId} testId Test ID of the test whose more information
 *    container to toggle.
 * @param {Event} event The mouse event to toggle show more information.
 * @private
 */
ccd.GuiManager.prototype.toggleShowMoreInformation_ = function(testId, event) {
  this.uiState_.expandTestResult();
  // Prevent clicking on the logs <textarea> from collapsing the more
  //   information field.
  if (event.srcElement.className == 'test-results-logs-textarea') {
    event.stopPropagation();
    return;
  }

  var testResultFrameId = 'test-result-frame-' + testId;
  var miDom = document.getElementById(
      'more-info-container-' + testId);
  if (miDom.className == 'element-hidden') {
    miDom.className = 'element-block';
    document.getElementById(testResultFrameId).className =
        'test-results-contents-frame test-results-contents-frame-expanded';
  } else {
    miDom.className = 'element-hidden';
    document.getElementById(testResultFrameId).className =
        'test-results-contents-frame';
  }
  event.stopPropagation();
};


/**
 * Fill in the details of the results of a given test.
 * @param {ccd.TestResult} testResult Result to paint within extant frame.
 * @private
 */
ccd.GuiManager.prototype.paintTestResult_ = function(testResult) {
  var testResultFrameId = 'test-result-frame-' + testResult.getTestId();
  if (document.getElementById(testResultFrameId) == undefined) {
    this.paintTestResultFrame_(testResult);
  } else {
    return;
  }

  // Set Verdict-Specific Variables
  var titleClassName = '';
  var titleHtml = testResult.getTitle();
  var subtitleText = testResult.getSubtitle();
  var divImageClass = '';
  switch (testResult.getTestVerdict()) {
    case ccd.TestVerdict.NO_PROBLEM:
      titleClassName = 'test-title test-verdict-pass';
      divImageClass = 'no-problem-result-title-img';
      break;
    case ccd.TestVerdict.POTENTIAL_PROBLEM:
      titleClassName = 'test-title test-verdict-warning';
      divImageClass = 'potential-problem-result-title-img';
      break;
    case ccd.TestVerdict.PROBLEM:
      titleClassName = 'test-title test-verdict-fail';
      divImageClass = 'problem-result-title-img';
      break;
  }

  // Create Test Title
  var title = document.createElement('div');
  title.className = titleClassName;
  title.innerHTML = '<div class="issue-found-title-contents-cell">' +
      '<div class="' + divImageClass + '"></div>' +
      '</div>' +
      '<div class="issue-found-title-contents-cell">' + titleHtml + '</div>';
  title.addEventListener('click',
      this.toggleShowMoreInformation_.bind(this, testResult.getTestId()),
      false);
  document.getElementById(testResultFrameId).appendChild(title);

  // Create More Information Container
  var moreInfo = document.createElement('div');
  moreInfo.id = 'more-info-container-' + testResult.getTestId();
  moreInfo.className = 'element-hidden';

  moreInfo.addEventListener('click',
      this.toggleShowMoreInformation_.bind(this, testResult.getTestId()),
      false);
  document.getElementById(testResultFrameId).appendChild(moreInfo);

  // Create Test Subtitle
  var testSubtitle = document.createElement('div');
  testSubtitle.id = 'test-subtitle-' + testResult.getTestId();
  testSubtitle.innerHTML = subtitleText;
  testSubtitle.className = 'test-subtitle';
  document.getElementById('more-info-container-' + testResult.getTestId()).
      appendChild(testSubtitle);

  // Create a link to "Show Logs"
  var logsTitleContainer = document.createElement('div');
  var logsTitle = document.createElement('a');
  logsTitle.id = 'show-logs-link-' + testResult.getTestId();
  logsTitle.innerHTML = chrome.i18n.getMessage('test_result_show_logs');
  logsTitle.className = 'show-logs-link show-logs-link-a';
  logsTitle.addEventListener('click',
      this.handleShowLogsClick_.bind(this, testResult.getTestId()),
      false);
  logsTitleContainer.appendChild(logsTitle);
  document.getElementById('more-info-container-' + testResult.getTestId()).
      appendChild(logsTitleContainer);

  // Create Container for Logs for Test and Append to More Information
  var logContainer = document.createElement('div');
  logContainer.id = 'log-container-' + testResult.getTestId();
  logContainer.className = 'element-hidden';
  moreInfo.appendChild(logContainer);

  var logs = document.createElement('textarea');
  logs.className = 'test-results-logs-textarea';
  logs.readOnly = true;
  logs.cols = 60;
  logs.rows = 10;

  var logStr = chrome.i18n.getMessage('test_result_log_test_id') +
      testResult.getTestId() + '\n';
  logStr += chrome.i18n.getMessage('test_result_log_test_verdict');
  switch (testResult.getTestVerdict()) {
    case ccd.TestVerdict.NO_PROBLEM:
      logStr +=
          chrome.i18n.getMessage('test_result_log_verdict_no_problem');
      break;
    case ccd.TestVerdict.PROBLEM:
      logStr +=
          chrome.i18n.getMessage('test_result_log_verdict_problem');
      break;
    case ccd.TestVerdict.POTENTIAL_PROBLEM:
      logStr +=
          chrome.i18n.getMessage('test_result_log_verdict_potential_problem');
      break;
    default:
      testResult.getTestVerdict();
  }
  logStr += '\n';
  logStr += '\n';

  var testLogs = testResult.getLogs();
  for (var i = 0; i < testLogs.length; i++) {
    logStr += testLogs[i] + '\n';
  }
  logs.value = logStr;

  document.getElementById(logContainer.id).appendChild(logs);
};


/**
 * Populate the results frame, which includes information for tests
 *   that failed, tests that yielded warnings, and provides the
 *   ability to expand and then view results for tests that passed.
 * @param {ccd.TestResults} testResults Results from tests to be populated
 *   into the page.
 * @private
 */
ccd.GuiManager.prototype.fillResultsPage_ = function(testResults) {
  var failedTests =
      testResults.getTestResultsByVerdict(ccd.TestVerdict.PROBLEM);
  var warningTests =
      testResults.getTestResultsByVerdict(ccd.TestVerdict.POTENTIAL_PROBLEM);

  // Print "Issues Found" Banner
  var issuesFoundTitleDom = document.createElement('div');
  issuesFoundTitleDom.id = 'issues-found-title';
  if (this.testIssuesToDisplay_()) {
    issuesFoundTitleDom.className = 'test-results-contents';
  } else {
    issuesFoundTitleDom.className = 'element-hidden';
  }
  if (failedTests.length + warningTests.length == 1) {
    issuesFoundTitleDom.innerHTML =
        chrome.i18n.getMessage('test_result_issue_found');
  } else {
    issuesFoundTitleDom.innerHTML =
        chrome.i18n.getMessage('test_result_issues_found');
  }
  document.getElementById(this.testsResultsContentsId_).
      insertBefore(issuesFoundTitleDom,
          document.getElementById(this.testsResultsContentsId_).firstChild);

  // Show Tests That Failed
  for (var i = 0; i < failedTests.length; i++) {
    if (!(failedTests[i] instanceof ccd.TestResult)) continue;
    this.paintTestResult_(failedTests[i]);
  }

  // Show Tests That Warned
  for (var i = 0; i < warningTests.length; i++) {
    if (!(warningTests[i] instanceof ccd.TestResult)) continue;
    this.paintTestResult_(warningTests[i]);
  }

  // Show Tests That Passed
  var passedTests =
      testResults.getTestResultsByVerdict(ccd.TestVerdict.NO_PROBLEM);
  for (var i = 0; i < passedTests.length; i++) {
    if (!(passedTests[i] instanceof ccd.TestResult)) continue;
    this.paintTestResult_(passedTests[i]);
  }

  // Print "Passing Tests" Banner/Header
  var passingTestsTitleDom = document.createElement('div');
  passingTestsTitleDom.id = 'passing-tests-title';
  if (this.showPassingTestsResults_) {
    passingTestsTitleDom.className = 'test-results-contents';
  } else {
    passingTestsTitleDom.className = 'element-hidden';
  }
  passingTestsTitleDom.innerHTML =
      chrome.i18n.getMessage('passing_tests_title');
  document.getElementById(this.testsResultsContentsId_).
      insertBefore(passingTestsTitleDom,
          document.getElementById(this.testsResultsPassingFrameId_));
};


/**
 * Setup the DOM for printing out test results.
 * @private
 */
ccd.GuiManager.prototype.setupDomForTestResults_ = function() {
  // Step 1: Setup Frame to Print out All Results for Tests
  var resultsPageFrame = document.getElementById(this.testsResultsFrameId_);
  if (resultsPageFrame != undefined) {
    // results frame already exists and is probably populated
    // keep the frame present, but clean its contents to prevent
    //   painting duplicate information
    resultsPageFrame.parentNode.removeChild(resultsPageFrame);
  }

  // Step 1B: Steup Root Frame for Test Results
  var resultsFrame = document.createElement('div');
  resultsFrame.id = this.testsResultsFrameId_;
  if (this.testIssuesToDisplay_()) {
    resultsFrame.className = 'element-block';
  } else {
    resultsFrame.className = 'element-hidden';
  }
  var resultsContents = document.createElement('div');
  resultsContents.id = this.testsResultsContentsId_;
  resultsFrame.appendChild(resultsContents);
  document.getElementById(this.pageBodyContainerDomId_).
      appendChild(resultsFrame);

  // Step 2a: Setup Containers for Failing, Warning, and Passing Tests
  var failingTestsFrame = document.createElement('div');
  failingTestsFrame.id = this.testsResultsFailingFrameId_;
  resultsContents.appendChild(failingTestsFrame);

  var warningTestsFrame = document.createElement('div');
  warningTestsFrame.id = this.testsResultsWarningFrameId_;
  resultsContents.appendChild(warningTestsFrame);

  // Step 2b: Setup Containers for Passing Tests
  var passingTestsFrame = document.createElement('div');
  passingTestsFrame.id = this.testsResultsPassingFrameId_;
  if (this.showPassingTestsResults_) {
    document.getElementById(this.testsResultsFrameId_).className =
        'element-block';
  } else {
    passingTestsFrame.className = 'element-hidden';
  }
  resultsContents.appendChild(passingTestsFrame);
};


/**
 * Determine whether any connectivity test issues exist.
 * @return {boolean} Whether there are any connectivity test issues to display.
 * @private
 */
ccd.GuiManager.prototype.testIssuesToDisplay_ = function() {
  if (this.finishedTestResults_.
      getTestResultsByVerdict(ccd.TestVerdict.PROBLEM).length != 0 ||
      this.finishedTestResults_.
      getTestResultsByVerdict(ccd.TestVerdict.POTENTIAL_PROBLEM).length != 0) {
    return true;
  } else {
    return false;
  }
};


/**
 * Setup the DOM to show that no problems were found and render the
 *   resulting message to users.
 * @private
 */
ccd.GuiManager.prototype.paintNoProblemResults_ = function() {
  if (this.testIssuesToDisplay_()) {
    return;
  }

  var noProblemsContainer = document.createElement('div');
  noProblemsContainer.id = 'no-problems-result-container';

  var noProblemContents = document.createElement('div');
  noProblemContents.id = 'no-problems-result-contents';
  noProblemsContainer.appendChild(noProblemContents);

  var noProblemInnerContainer = document.createElement('div');
  noProblemInnerContainer.innerHTML =
      '<div class="no-problem-result-inner-contents">' +
      '<div id="no-problem-result-img"></div></div>' +
      '<div class="no-problem-result-inner-contents">' +
      chrome.i18n.getMessage('result_no_connectivity_problems') +
      '</div>';
  noProblemContents.appendChild(noProblemInnerContainer);

  document.getElementById(this.pageBodyContainerDomId_).
      appendChild(noProblemsContainer);
};


/**
 * Eliminate the contents in the DOM of the main body.
 * @private
 */
ccd.GuiManager.prototype.cleanupBodyContentsDom_ = function() {
  var node = document.getElementById(this.pageBodyContainerDomId_);
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
};


/**
 * Callback function invoked to display the results of the tests run.
 * @param {ccd.TestResults} testResults Test results to display onto page.
 */
ccd.GuiManager.prototype.displayResults = function(testResults) {
  this.finishedTestResults_ = testResults;
  window.clearTimeout(this.testsRunningTimeoutId_);

  this.cleanupBodyContentsDom_();

  this.paintNoProblemResults_();
  this.setupDomForTestResults_();
  this.fillResultsPage_(this.finishedTestResults_);
};


/**
 * Callback function invoked to display progress in running tests.
 * @param {number} percentCompleted The percent complete (e.g., 20) that
 *   the test suite is.
 * @param {string=} opt_message Progress message to display to the user.
 */
ccd.GuiManager.prototype.displayProgress = function(percentCompleted,
                                                    opt_message) {
  var progress = document.getElementById(this.spinnerProgressContentsDomId_);
  switch (true) {
    case (percentCompleted == 100):
      progress.innerHTML = '100%';
      progress.className = 'spinner-progress-100';
      break;
    case (percentCompleted > 90):
      progress.innerHTML = '90%';
      progress.className = 'spinner-progress-90';
      break;
    case (percentCompleted > 75):
      progress.innerHTML = '75%';
      progress.className = 'spinner-progress-75';
      break;
    case (percentCompleted > 60):
      progress.innerHTML = '60%';
      progress.className = 'spinner-progress-60';
      break;
    case (percentCompleted > 50):
      progress.innerHTML = '50%';
      progress.className = 'spinner-progress-50';
      break;
    case (percentCompleted > 40):
      progress.innerHTML = '40%';
      progress.className = 'spinner-progress-40';
      break;
    case (percentCompleted > 25):
      progress.innerHTML = '25%';
      progress.className = 'spinner-progress-25';
      break;
    case (percentCompleted > 15):
      progress.innerHTML = '15%';
      progress.className = 'spinner-progress-15';
      break;
    case (percentCompleted == 0):
      progress.innerHTML = '0%';
      progress.className = 'spinner-progress-00';
      break;
  }
};


/**
 * The tests experienced an unexpected error and need to be stopped.
 * Or, the tests simply timed out.
 * @private
 */
ccd.GuiManager.prototype.handleTestErrors_ = function() {
  window.clearTimeout(this.testsRunningTimeoutId_);
  // TODO: Print Logs, Including Logs From Failed Test
};


/**
 * Run tests to find connectivity problems. When the tests finish,
 *   display the results onto the screen.
 */
ccd.GuiManager.prototype.runTests = function() {
  // Set a timeout so that if the tests do not return by a specific time,
  //   the tests stop running.
  if (ccd.TestConfVars.TOTAL_TESTS_TIMEOUT_SEC > 0) {
    this.testsRunningTimeoutId_ = setTimeout(this.handleTestErrors_.bind(this),
        1000 * ccd.TestConfVars.TOTAL_TESTS_TIMEOUT_SEC);
  }

  var finishedCallbackFnc = this.displayResults.bind(this);
  var progressCallbackFnc = this.displayProgress.bind(this);
  this.testsManager_ = new ccd.TestsManager(finishedCallbackFnc,
                                            progressCallbackFnc);
  this.testsManager_.runTests();
};


/**
 * Maximize the window (if it is not already) or un-maximize it and move
 *   it to the center of the screen.
  * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.GuiManager.prototype.handleMaximizeBtnClick_ = function(event) {
  var appWindow = chrome.app.window.current();
  if (ccd.util.isChromeOS()) {
    if (appWindow.isMaximized()) {
      appWindow.restore();
    } else {
      appWindow.maximize();
    }
  } else {
    var windowWidth = appWindow.getBounds().width;
    if (windowWidth == ccd.flags.getFlag('initAppWidth')) {
      appWindow.maximize();
    } else {
      appWindow.resizeTo(
          /** @type {number} */ (ccd.flags.getFlag('initAppWidth')),
          /** @type {number} */ (ccd.flags.getFlag('initAppHeight'))
      );
      this.centerAppWindow_();
    }
  }
  event.stopPropagation();
};


/**
 * Center the app on the screen.
 * @private
 */
ccd.GuiManager.prototype.centerAppWindow_ = function() {
  var newX = (screen.width - ccd.flags.getFlag('initAppWidth')) / 2;
  var newY = (screen.height - ccd.flags.getFlag('initAppHeight')) / 2;
  chrome.app.window.current().moveTo(newX, newY);
};


/**
 * Close the settings menu in the upper right.
 * @private
 */
ccd.GuiManager.prototype.closeSettingsMenu_ = function() {
  document.getElementById(this.settingsDomId_).className = 'element-hidden';
  document.getElementById('top-settings-btn').className = '';
  this.showSettings_ = false;
};


/**
 * Open the settings menu in the upper right.
 * @private
 */
ccd.GuiManager.prototype.openSettingsMenu_ = function() {
  document.getElementById(this.settingsDomId_).className = 'settings-visible';
  document.getElementById('top-settings-btn').className =
      'settings-menu-link-expanded';

  this.showSettings_ = true;
};


/**
 * Expand or contract the settings menu.
 * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.GuiManager.prototype.handleSettingsBtnClick_ = function(event) {
  this.uiState_.settingsShown();
  if (this.showSettings_) {
    this.closeSettingsMenu_();
  } else {
    this.openSettingsMenu_();
  }
  event.stopPropagation();
};


/**
 * If the user clicks anywhere on the page that doesn't have an event
 *   listener registered, close the menu if it is open.
 * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.GuiManager.prototype.handlePageClickCloseMenu_ = function(event) {
  if (this.showSettings_) {
    this.closeSettingsMenu_();
  }
  event.stopPropagation();
};


/**
 * @private
 */
ccd.GuiManager.prototype.showPassingTests_ = function() {
  this.uiState_.passingTestsShown();
  this.showPassingTestsResults_ = true;
  document.getElementById(this.togglePassingTestsLinkDomId_).innerHTML =
      chrome.i18n.getMessage('setting_hide_passing_test');

  if (document.getElementById(this.testsResultsPassingFrameId_) != undefined) {
    document.getElementById(this.testsResultsPassingFrameId_).className = '';
    document.getElementById('passing-tests-title').className =
        'test-results-contents';
    document.getElementById(this.testsResultsFrameId_).className =
        'element-block';
  }
};


/**
 * @private
 */
ccd.GuiManager.prototype.hidePassingTests_ = function() {
  this.showPassingTestsResults_ = false;
  document.getElementById(this.togglePassingTestsLinkDomId_).innerHTML =
      chrome.i18n.getMessage('setting_show_passing_test');

  if (document.getElementById(this.testsResultsPassingFrameId_) != undefined) {
    document.getElementById(this.testsResultsPassingFrameId_).className =
        'element-hidden';
    document.getElementById('passing-tests-title').className =
        'element-hidden';
  }
};


/**
 * Show the results for the connectivity tests that passed.
 * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.GuiManager.prototype.handleShowPassingTestsBtnClick_ = function(event) {
  if (this.showPassingTestsResults_) {
    this.hidePassingTests_();
  } else {
    this.showPassingTests_();
  }

  event.stopPropagation();
  // Now that settings changed, close the menu.
  this.closeSettingsMenu_();
};


/**
 * Add event listeners to the various buttons on the screen.
 * @private
 */
ccd.GuiManager.prototype.addEventListeners_ = function() {
  document.getElementById('top-settings-btn').
      addEventListener('click',
                       this.handleSettingsBtnClick_.bind(this),
                       false);

  document.getElementById('top-maximize-btn').
      addEventListener('click',
                       this.handleMaximizeBtnClick_.bind(this),
                       false);

  document.getElementById('top-close-btn').
      addEventListener('click',
                       function() { window.close(); },
                       false);

  document.getElementById(this.togglePassingTestsLinkDomId_).
      addEventListener('click',
                       this.handleShowPassingTestsBtnClick_.bind(this),
                       false);
  document.body.
      addEventListener('click',
                       this.handlePageClickCloseMenu_.bind(this),
                       false);
};


/**
 * Construct the basic layout of the DOM and add event listeners.
 */
ccd.GuiManager.prototype.constructDom = function() {
  // STEP 1: Construct the DOM.
  var initialBodyHtml = '<div id="ccd-header">' +
      '<div id="header-title-container">' +
      chrome.i18n.getMessage('apptitle') + '</div>' +
      '<div id="header-options-container">' +
      '   <button id="top-settings-btn" ' +
      '     tabindex="1" />' +
      '   <button id="top-maximize-btn" ' +
      '     tabindex="2" />' +
      '   <button id="top-close-btn" ' +
      '     tabindex="3" />' +
      '</div>' +
      '</div><!-- End ID=headerbar -->' +

      '<div id="' + this.pageBodyContainerDomId_ + '">' +
      '<div id="page-body-spinner-container">' +
      '    <div id="page-body-spinner-progress-percentile">' +
      '    <div id="' + this.spinnerProgressContentsDomId_ + '"></div>' +
      '    </div><!-- End ID=page-body-spinner-progress-percentile -->' +
      '    <div id="page-body-spinner-loading-message">' +
      chrome.i18n.getMessage('tests_running_message') +
      '    </div><!-- End ID=page-body-spinner-loading-message -->' +
      '</div><!-- End ID=page-spinner-container -->' +

      '</div><!-- End ID=' + this.pageBodyContainerDomId_ + ' -->';

  initialBodyHtml += '<div id="' + this.settingsDomId_ + '" ' +
      'class="element-hidden">' +
      '<a id="' + this.togglePassingTestsLinkDomId_ + '">' +
      chrome.i18n.getMessage('setting_show_passing_test') + '</a></div>';

  document.getElementById('ccd-app').innerHTML = initialBodyHtml;

  // STEP 2: Add event listeners to the DOM.
  this.addEventListeners_();

  // STEP 3: Change the title to be localized
  document.title = chrome.i18n.getMessage('apptitle');
};
