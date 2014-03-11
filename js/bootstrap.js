// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Bootstrap the management of the GUI.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd');
goog.provide('ccd.Bootstrap');

goog.require('ccd.GuiManager');
goog.require('ccd.flags');
goog.require('ccd.metrics');
goog.require('ccd.util');



/**
 * Bootstrap the network debugger app.
 * @constructor
 */
ccd.Bootstrap = function() {
  this.processFlags_();

  ccd.metrics.recordUserAction('TestSuiteRun');
  ccd.metrics.recordAppVersion(ccd.util.getAppVersion());
  if (ccd.flags.getFlag('launchSource')) {
    ccd.metrics.recordLaunchSource(
        /** @type {string} */ (ccd.flags.getFlag('launchSource')));
  }
  /**
   * @private {ccd.GuiManager}
   */
  this.guiManager_ = new ccd.GuiManager();
  this.guiManager_.constructDom();
  this.guiManager_.runTests();
};


/**
 * Return the querystring of the application page.
 * Helpful for testing.
 * @return {string} Querystring of the application page.
 * @private
 */
ccd.Bootstrap.prototype.getQuerystring_ = function() {
  return location.search;
};


/**
 * Process flags
 * @private
 */
ccd.Bootstrap.prototype.processFlags_ = function() {
  var qString = this.getQuerystring_();
  if (qString.length > 0) {
    if (qString[0] == '?') {
      qString = qString.slice(1);
    }

    var keyValuePairs = qString.split('&');
    for (var i = 0; i < keyValuePairs.length; i++) {
      var key = keyValuePairs[i].slice(0, keyValuePairs[i].indexOf('='));
      var value = keyValuePairs[i].slice(keyValuePairs[i].indexOf('=') + 1);
      ccd.flags.addFlag(key, value);
    }
  }
};


goog.exportSymbol('ChromeConnectivityDebugger', ccd.Bootstrap);
