// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Bootstrap the management of the GUI.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd');
goog.provide('ccd.Bootstrap');

goog.require('ccd.flags');
goog.require('ccd.metrics');
goog.require('ccd.ui.Controller');
goog.require('ccd.util');



/**
 * Bootstrap the network debugger app.
 * @constructor
 */
ccd.Bootstrap = function() {
  this.processFlags_();

  ccd.metrics.recordUserAction('TestSuiteRun');
  ccd.metrics.recordAppVersion(ccd.util.getAppVersion());
  ccd.metrics.recordLaunchSource(
      /** @type {string} */ (ccd.flags.LAUNCH_SOURCE));

  /**
   * @private {ccd.ui.Controller}
   */
  this.uiController_ = null;
};


/**
 * Launch the application.
 * @expose
 */
ccd.Bootstrap.prototype.launch = function() {
  this.uiController_ = new ccd.ui.Controller();
  this.uiController_.launchTests();
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

      if (ccd.flags[key] !== undefined) {
        if (!isNaN(parseInt(value, 10))) {
          ccd.flags[key] = parseInt(value, 10);
        } else if (value.toLowerCase() == 'false') {
          ccd.flags[key] = false;
        } else if (value.toLowerCase() == 'true') {
          ccd.flags[key] = true;
        } else {
          ccd.flags[key] = value;
        }
      }
    }
  }
};


goog.exportSymbol('ChromeConnectivityDebugger', ccd.Bootstrap);
