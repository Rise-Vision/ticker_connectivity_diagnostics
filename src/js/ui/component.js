// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  Inferface for UI components.
 * @author ebeach@google.com (Eric Beach)
 */


goog.provide('ccd.ui.Component');



/**
 * @interface
 */
ccd.ui.Component = function() {};


/**
 * @param {!Element} element Parent DOM element.
 * @return {!Element} Element containing the rendered items.
 */
ccd.ui.Component.prototype.render = function(element) {};
