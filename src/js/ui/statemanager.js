// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI State manager.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.StateManager');



/**
 * @constructor
 */
ccd.ui.StateManager = function() {
  /**
   * @private {!Array.<function(boolean)>}
   */
  this.passingTestsChangeCallbacks_ = [];

  /**
   * @private {!Array.<function()>}
   */
  this.rerunTestsCallbacks_ = [];

  /**
   * @private {boolean}
   */
  this.passingTestsShown_ = false;
};


/** @private {ccd.ui.StateManager} */
ccd.ui.StateManager.instance_ = null;


/**
 * Get singleton instance of object.
 * @return {!ccd.ui.StateManager} Return singleton instance.
 */
ccd.ui.StateManager.getInstance = function() {
  if (!ccd.ui.StateManager.instance_) {
    ccd.ui.StateManager.instance_ = new ccd.ui.StateManager();
  }
  return ccd.ui.StateManager.instance_;
};


/**
 * @return {boolean} Whether the passing tests are being shown.
 */
ccd.ui.StateManager.prototype.getPassingTestsVivibility = function() {
  return this.passingTestsShown_;
};


/**
 * Receive notification that the setting for the desired visibility
 *   of the passing tests has been changed. Dispatch the registered
 *   events.
 */
ccd.ui.StateManager.prototype.togglePassingTestVisibility = function() {
  this.passingTestsShown_ = !this.passingTestsShown_;
  this.executePassingTestChangeCallbacks_();
};


/**
 * Execute all the callbacks that have been registered for applying
 *   visibility changes.
 * @private
 */
ccd.ui.StateManager.prototype.executePassingTestChangeCallbacks_ = function() {
  for (var i = 0; i < this.passingTestsChangeCallbacks_.length; i++) {
    this.passingTestsChangeCallbacks_[i](this.getPassingTestsVivibility());
  }
};


/**
 * Add a callback function to be executed when the state of passing tests
 *   change.
 * @param {function(boolean)} fnc Function to be triggered when the desired
 *    visibility setting is changed.
 */
ccd.ui.StateManager.prototype.addPassingTestsChangeCallback = function(fnc) {
  this.passingTestsChangeCallbacks_.push(fnc);
};


/**
 * Receive notification that the test suite should be re-run.
 */
ccd.ui.StateManager.prototype.rerunTests = function() {
  for (var i = 0; i < this.rerunTestsCallbacks_.length; i++) {
    this.rerunTestsCallbacks_[i]();
  }
};


/**
 * Add a callback function to be executed when the state of passing tests
 *   change.
 * @param {function()} fnc Function to be triggered when the tests
 *    should be re-run.
 */
ccd.ui.StateManager.prototype.addRerunTestsChangeCallback = function(fnc) {
  this.rerunTestsCallbacks_.push(fnc);
};
