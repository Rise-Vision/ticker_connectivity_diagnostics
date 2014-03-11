// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI component to page header.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.HeaderComponent');

goog.require('ccd.flags');
goog.require('ccd.service.FeedbackService');
goog.require('ccd.ui.Component');
goog.require('ccd.ui.MetricsHelper');
goog.require('ccd.ui.StateManager');
goog.require('ccd.ui.globals');
goog.require('ccd.util');



/**
 * @constructor
 * @implements {ccd.ui.Component}
 */
ccd.ui.HeaderComponent = function() {
  /**
   * Button for maximizing/resetting the application window.
   * @private {Element}
   */
  this.topMaximizeBtnElem_ = null;

  /**
   * Button for closing the application window.
   * @private {Element}
   */
  this.topCloseBtnElem_ = null;

  /**
   *
   * @private {Element}
   */
  this.topSettingsBtnElem_ = null;

  /**
   * Element to represent the anchor element in the epanded Settings Menu
   *   to toggle whether to show passing tests.
   * @private {Element}
   */
  this.passingTestsLinkElem_ = null;

  /**
   * Element to represent the container for the entire expanded settings menu.
   * @private {Element} = null;
   */
  this.settingsMenuDom_ = null;

  /**
   * Whether the settings are currently showing.
   * @private {boolean}
   */
  this.settingsShowing_ = false;

  /**
   * @private {ccd.ui.StateManager}
   */
  this.guiStateManager_ = ccd.ui.StateManager.getInstance();

  /**
   * @private {ccd.ui.MetricsHelper}
   */
  this.metricsHelper_ = ccd.ui.MetricsHelper.getInstance();

  /**
   * @private {ccd.service.FeedbackService}
   */
  this.feedbackService_ = ccd.service.FeedbackService.getInstance();
};


/** @override */
ccd.ui.HeaderComponent.prototype.render = function(element) {
  var ccdContainer = document.createElement('div');
  ccdContainer.id = 'ccd-header';

  var headerTitleContainer = document.createElement('div');
  headerTitleContainer.id = 'header-title-container';
  headerTitleContainer.appendChild(
      document.createTextNode(chrome.i18n.getMessage('apptitle')));
  ccdContainer.appendChild(headerTitleContainer);

  // Create DOM ID needed later
  var settingsMenuContainerDomId = 'settings-container';

  // Create the Settings, Maximize, and Close buttons.
  var headerSettingsOptionsContainer = document.createElement('div');
  headerSettingsOptionsContainer.id = 'header-options-container';
  ccdContainer.appendChild(headerSettingsOptionsContainer);

  this.topSettingsBtnElem_ = document.createElement('button');
  this.topSettingsBtnElem_.id = 'top-settings-btn';
  this.topSettingsBtnElem_.tabIndex = 1;
  this.topSettingsBtnElem_.setAttribute('aria-expanded', 'false');
  this.topSettingsBtnElem_.setAttribute('aria-controls',
      settingsMenuContainerDomId);
  this.topSettingsBtnElem_.setAttribute('aria-label',
      chrome.i18n.getMessage('aria_label_settings'));
  this.topSettingsBtnElem_.addEventListener('click',
      this.handleSettingsBtnClick_.bind(this),
      false);
  headerSettingsOptionsContainer.appendChild(this.topSettingsBtnElem_);

  this.topMaximizeBtnElem_ = document.createElement('button');
  this.topMaximizeBtnElem_.id = 'top-maximize-btn';
  this.topMaximizeBtnElem_.tabIndex = 15;
  this.topMaximizeBtnElem_.setAttribute('aria-label',
      chrome.i18n.getMessage('aria_label_maximize'));
  this.topMaximizeBtnElem_.addEventListener('click',
      this.handleMaximizeBtnClick_.bind(this),
      false);
  headerSettingsOptionsContainer.appendChild(this.topMaximizeBtnElem_);

  this.topCloseBtnElem_ = document.createElement('button');
  this.topCloseBtnElem_.id = 'top-close-btn';
  this.topCloseBtnElem_.tabIndex = 16;
  this.topCloseBtnElem_.setAttribute('aria-label',
      chrome.i18n.getMessage('aria_label_close'));
  this.topCloseBtnElem_.addEventListener('click',
      function() { window.close(); },
      false);
  headerSettingsOptionsContainer.appendChild(this.topCloseBtnElem_);

  // Create the Expanded Settings Menu
  this.settingsMenuContainerElem_ = document.createElement('div');
  this.settingsMenuContainerElem_.id = settingsMenuContainerDomId;
  this.settingsMenuContainerElem_.className = ccd.ui.globals.Css.HIDDEN;
  this.settingsMenuContainerElem_.tabIndex = 2;
  this.settingsMenuContainerElem_.addEventListener('blur',
      this.handlePageClickCloseMenu_.bind(this),
      true);

  // Create menu option to toggle passing test results.
  var passingTestsOptElem = document.createElement('div');
  this.passingTestsLinkElem_ = document.createElement('a');
  this.passingTestsLinkElem_.id = 'toggle-passing-tests-link';
  this.passingTestsLinkElem_.tabIndex = 3;
  this.passingTestsLinkElem_.innerHTML =
      chrome.i18n.getMessage('setting_show_passing_test');
  this.passingTestsLinkElem_.setAttribute('aria-expanded', 'false');
  this.passingTestsLinkElem_.setAttribute('aria-controls',
      ccd.ui.globals.DomIds.PASSING_TESTS_CONTAINER);
  this.passingTestsLinkElem_.addEventListener('click',
      this.passingTestsLinkClicked_.bind(this),
      false);
  this.passingTestsLinkElem_.addEventListener('keyup',
      this.passingTestsLinkClicked_.bind(this),
      false);
  passingTestsOptElem.appendChild(this.passingTestsLinkElem_);
  this.settingsMenuContainerElem_.appendChild(passingTestsOptElem);

  // Create menu option to re-run tests, if desired.
  if (ccd.flags.MENU_OPTION_TO_RERUN_TESTS) {
    var rerunTestsOptElem = document.createElement('div');
    var rerunTestsLinkElem_ = document.createElement('a');
    rerunTestsLinkElem_.tabIndex = 4;
    rerunTestsLinkElem_.innerHTML =
        chrome.i18n.getMessage('setting_rerun_tests');
    rerunTestsLinkElem_.addEventListener('click',
        this.rerunTestsLinkClicked_.bind(this),
        false);
    rerunTestsLinkElem_.addEventListener('keyup',
        this.rerunTestsLinkClicked_.bind(this),
        false);
    rerunTestsOptElem.appendChild(rerunTestsLinkElem_);
    this.settingsMenuContainerElem_.appendChild(rerunTestsOptElem);
  }

  // Create menu option to send feedback.
  if (ccd.flags.MENU_OPTION_TO_SEND_CHROME_FEEDBACK) {
    var rerunTestsOptElem = document.createElement('div');
    var rerunTestsLinkElem_ = document.createElement('a');
    rerunTestsLinkElem_.tabIndex = 5;
    rerunTestsLinkElem_.innerHTML =
        chrome.i18n.getMessage('setting_send_feedback');
    rerunTestsLinkElem_.addEventListener('click',
        this.sendFeedbackLinkClicked_.bind(this),
        false);
    rerunTestsLinkElem_.addEventListener('keyup',
        this.sendFeedbackLinkClicked_.bind(this),
        false);
    rerunTestsOptElem.appendChild(rerunTestsLinkElem_);
    this.settingsMenuContainerElem_.appendChild(rerunTestsOptElem);
  }

  ccdContainer.appendChild(this.settingsMenuContainerElem_);

  element.appendChild(ccdContainer);
  return ccdContainer;
};


/**
 * @param {Event} event DOM Event when the re-run tests link is clicked.
 * @private
 */
ccd.ui.HeaderComponent.prototype.rerunTestsLinkClicked_ = function(event) {
  this.guiStateManager_.rerunTests.apply(this.guiStateManager_);
};


/**
 * @param {Event} event DOM Event when the send feedback link is clicked.
 * @private
 */
ccd.ui.HeaderComponent.prototype.sendFeedbackLinkClicked_ = function(event) {
  this.feedbackService_.sendFeedback.apply(this.feedbackService_);
};


/**
 * @param {Event} event DOM Event when the passing tests link is clicked.
 * @private
 */
ccd.ui.HeaderComponent.prototype.passingTestsLinkClicked_ = function(event) {
  if (event && event.type == 'keyup' &&
      event.keyCode !== ccd.ui.globals.KeyCode.ENTER) {
    // Key was pressed, but it is not Enter.
    return;
  }

  if (this.guiStateManager_.getPassingTestsVivibility()) {
    this.passingTestsLinkElem_.innerHTML =
        chrome.i18n.getMessage('setting_show_passing_test');
    this.passingTestsLinkElem_.setAttribute('aria-expanded', 'false');
  } else {
    this.passingTestsLinkElem_.innerHTML =
        chrome.i18n.getMessage('setting_hide_passing_test');
    this.passingTestsLinkElem_.setAttribute('aria-expanded', 'true');
  }
  this.guiStateManager_.togglePassingTestVisibility.apply(
      this.guiStateManager_);

  // Now that settings changed, close the menu and record the statistic.
  this.closeSettingsMenu_();
  this.metricsHelper_.passingTestsShown();
};


/**
 * Close the settings menu in the upper right.
 * @private
 */
ccd.ui.HeaderComponent.prototype.closeSettingsMenu_ = function() {
  this.settingsMenuContainerElem_.className = ccd.ui.globals.Css.HIDDEN;
  this.topSettingsBtnElem_.className = '';
  this.topSettingsBtnElem_.setAttribute('aria-expanded', 'false');
  this.settingsShowing_ = false;
};


/**
 * Open the settings menu in the upper right.
 * @private
 */
ccd.ui.HeaderComponent.prototype.openSettingsMenu_ = function() {
  this.metricsHelper_.settingsShown();
  this.settingsMenuContainerElem_.className = 'settings-visible';
  this.topSettingsBtnElem_.className =
      'settings-menu-link-expanded';
  this.topSettingsBtnElem_.setAttribute('aria-expanded', 'true');
  this.settingsShowing_ = true;
  this.settingsMenuContainerElem_.focus();
};


/**
 * Check whether a DOM element is a child of the menu structure.
 * @param {Node} elem DOM node to check.
 * @return {boolean} Whether an element is a child of the menu structure.
 * @private
 */
ccd.ui.HeaderComponent.prototype.isElementMenuChild_ = function(elem) {
  if (elem == document.body) {
    return false;
  } else if (elem == this.settingsMenuContainerElem_) {
    return true;
  } else {
    return this.isElementMenuChild_(elem.parentNode);
  }
};


/**
 * If the user clicks anywhere on the page that doesn't have an event
 *   listener registered, close the menu if it is open.
 * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.ui.HeaderComponent.prototype.handlePageClickCloseMenu_ = function(event) {
  if (event.relatedTarget == this.topSettingsBtnElem_) {
    return;
  }
  if (this.settingsShowing_ &&
      event.relatedTarget != null &&
      !this.isElementMenuChild_(
      /** @type {Node} */ (event.relatedTarget))) {
    this.closeSettingsMenu_();
  } else if (this.settingsShowing_ &&
             event.relatedTarget == null &&
             document.activeElement.id == 'ccd-app') {
    this.closeSettingsMenu_();
  }
};


/**
 * Expand or contract the settings menu.
 * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.ui.HeaderComponent.prototype.handleSettingsBtnClick_ = function(event) {
  if (this.settingsShowing_) {
    this.closeSettingsMenu_();
  } else {
    this.openSettingsMenu_();
  }
};


/**
 * Maximize the window (if it is not already) or un-maximize it and move
 *   it to the center of the screen.
  * @param {Event} event The mouse event for the click.
 * @private
 */
ccd.ui.HeaderComponent.prototype.handleMaximizeBtnClick_ = function(event) {
  var appWindow = chrome.app.window.current();
  if (ccd.util.isChromeOS()) {
    if (appWindow.isMaximized()) {
      appWindow.restore();
    } else {
      appWindow.maximize();
    }
  } else {
    var windowWidth = appWindow.getBounds().width;
    if (windowWidth == ccd.flags.INIT_APP_WIDTH) {
      appWindow.maximize();
    } else {
      appWindow.resizeTo(
          /** @type {number} */ (ccd.flags.INIT_APP_WIDTH),
          /** @type {number} */ (ccd.flags.INIT_APP_HEIGHT)
      );
      this.centerAppWindow_();
    }
  }
};


/**
 * Center the app on the screen.
 * @private
 */
ccd.ui.HeaderComponent.prototype.centerAppWindow_ = function() {
  var newX = (screen.width - ccd.flags.INIT_APP_WIDTH) / 2;
  var newY = (screen.height - ccd.flags.INIT_APP_HEIGHT) / 2;
  chrome.app.window.current().moveTo(newX, newY);
};
