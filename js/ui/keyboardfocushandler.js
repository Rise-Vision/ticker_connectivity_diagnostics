// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Automatically hides focus outlines unless the
 *   user is navigating using the keyboard.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ui.KeyboardFocusHandler');



/**
 * Class to hide focus outlines unless the user is navigating
 *   using the keyboard.
 * @constructor
 */
ccd.ui.KeyboardFocusHandler = function() {};


/** @private {ccd.ui.KeyboardFocusHandler} */
ccd.ui.KeyboardFocusHandler.instance_ = null;


/**
 * Get singleton instance of object.
 * @return {!ccd.ui.KeyboardFocusHandler} Return singleton instance.
 */
ccd.ui.KeyboardFocusHandler.getInstance = function() {
  if (!ccd.ui.KeyboardFocusHandler.instance_) {
    ccd.ui.KeyboardFocusHandler.instance_ = new ccd.ui.KeyboardFocusHandler();
  }
  return ccd.ui.KeyboardFocusHandler.instance_;
};


/**
 * Attach event listeners to the body to listen for events to change focus
 *   styling.
 */
ccd.ui.KeyboardFocusHandler.prototype.attachFocusListeners = function() {
  document.addEventListener('mousedown',
                            this.onMouseDown_.bind(this),
                            false);
  document.addEventListener('keydown',
                            this.onKeyDown_.bind(this),
                            false);
};


/**
 * Handle keydown on the page.
 * @param {Event} event The key event for the pressing.
 * @private
 */
ccd.ui.KeyboardFocusHandler.prototype.onKeyDown_ = function(event) {
  if (event.keyCode == ccd.ui.globals.KeyCode.TAB) {
    this.setShowFocusOutlines_(true);
  }
  if (event.keyCode == ccd.ui.globals.KeyCode.ESCAPE &&
      document.activeElement) {
    document.activeElement.blur();
  }
};


/**
 * Handle mouse down on the page.
 * @param {Event} event The mouse event for the clicking.
 * @private
 */
ccd.ui.KeyboardFocusHandler.prototype.onMouseDown_ = function(event) {
  this.setShowFocusOutlines_(false);
};


/**
 * Set the outline styling.
 * @param {boolean} show Whether to show outline around element.
 * @private
 */
ccd.ui.KeyboardFocusHandler.prototype.setShowFocusOutlines_ = function(show) {
  if (show) {
    document.body.className = '';
  } else {
    document.body.className = 'no-focus-outline';
  }
};
