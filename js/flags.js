// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview Flags for the CCD application.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.flags');


/**
 * Global object for setting and getting application flags passed into the
 *   Chrome app.
 */
ccd.flags = {};


/**
 * @private {Object.<string, string|number|boolean>}
 */
ccd.flags.flags_ = {};


/**
  * Add an application flag.
  * @param {string} name The name of the flag.
  * @param {string|number|boolean} value The value of the flag.
  */
ccd.flags.addFlag = function(name, value) {
  ccd.flags.flags_[name] = value;
};


/**
 * Get an application flag.
 * @param {string} name The name of the flag to get.
 * @return {string|number|boolean} The value of the flag.
 */
ccd.flags.getFlag = function(name) {
  if (ccd.flags.flags_[name] != undefined) {
    return ccd.flags.flags_[name];
  } else {
    return '';
  }
};


/**
 * Clear all the application flags.
 */
ccd.flags.clearFlags = function() {
  ccd.flags.flags_ = {};
};
