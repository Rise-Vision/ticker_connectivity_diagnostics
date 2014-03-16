// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI component for tests running spinner.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.SpinnerComponent');



/**
 * @constructor
 * @implements {ccd.ui.Component}
 */
ccd.ui.SpinnerComponent = function() {
  /**
   * @private {Element}
   */
  this.spinnerContentsElem_ = null;
};


/** @override */
ccd.ui.SpinnerComponent.prototype.render = function(element) {
  var spinnerContainer = document.createElement('div');
  spinnerContainer.id = 'page-body-spinner-container';

  var spinnerPercentile = document.createElement('div');
  spinnerPercentile.id = 'page-body-spinner-progress-percentile';
  spinnerContainer.appendChild(spinnerPercentile);

  this.spinnerContentsElem_ = document.createElement('div');
  this.spinnerContentsElem_.id = 'page-body-spinner-progress-content';
  spinnerPercentile.appendChild(this.spinnerContentsElem_);

  var spinnerLoadingMessage = document.createElement('div');
  spinnerLoadingMessage.id = 'page-body-spinner-loading-message';
  spinnerLoadingMessage.innerHTML =
      chrome.i18n.getMessage('tests_running_message');
  spinnerContainer.appendChild(spinnerLoadingMessage);

  element.appendChild(spinnerContainer);
  return spinnerContainer;
};


/**
 * Callback function invoked to display progress in running tests.
 * @param {number} percentComplete The percent complete (e.g., 20) that
 *   the test suite is.
 */
ccd.ui.SpinnerComponent.prototype.displayProgress = function(percentComplete) {
  if (!this.spinnerContentsElem_) {
    return;
  }

  var displayedPercent = 0;
  if (percentComplete == 100) {
    displayedPercent = 100;
  } else if (percentComplete > 90) {
    displayedPercent = 90;
  } else if (percentComplete > 75) {
    displayedPercent = 75;
  } else if (percentComplete > 60) {
    displayedPercent = 60;
  } else if (percentComplete > 50) {
    displayedPercent = 50;
  } else if (percentComplete > 40) {
    displayedPercent = 40;
  } else if (percentComplete > 25) {
    displayedPercent = 25;
  } else if (percentComplete > 15) {
    displayedPercent = 15;
  }

  this.spinnerContentsElem_.innerHTML = displayedPercent + '%';
  this.spinnerContentsElem_.className = 'spinner-progress-' + displayedPercent;
};
