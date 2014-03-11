// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview  UI component to render a component explaining that no
 *    problems were found.
 * @author ebeach@google.com (Eric Beach)
 */

goog.provide('ccd.ui.NoProblemsResultComponent');



/**
 * @constructor
 * @implements {ccd.ui.Component}
 */
ccd.ui.NoProblemsResultComponent = function() {};


/** @override */
ccd.ui.NoProblemsResultComponent.prototype.render = function(element) {
  var noProblemsContainer = document.createElement('div');
  noProblemsContainer.id = 'no-problems-result-container';

  var noProblemContents = document.createElement('div');
  noProblemContents.id = 'no-problems-result-contents';
  noProblemsContainer.appendChild(noProblemContents);

  var noProblemInnerContainer = document.createElement('div');
  noProblemInnerContainer.innerHTML =
      '<div class="no-problem-result-inner-contents">' +
      '<div id="no-problem-result-img" role="alert"></div></div>' +
      '<div class="no-problem-result-inner-contents">' +
      chrome.i18n.getMessage('result_no_connectivity_problems') +
      '</div>';
  noProblemContents.appendChild(noProblemInnerContainer);

  element.appendChild(noProblemsContainer);

  return noProblemsContainer;
};
