"use strict";

/* mostly relevant to Twerkin.form.php page */
function clearForm() {
  var newItemInput = document.getElementById('newItemInput');
  var dataHref01 = document.getElementById('dataHref01');
  var dataHref02 = document.getElementById('dataHref02');
  dataHref01.innerHTML = '';
  dataHref02.innerHTML = '';
  newItemInput.value = '';
}

function appendDataHref01() {
  /*
  initialize primary symbols */

  /*
  @param prefixSelect dropdown
  @param suffixSelect html dropdown
  */
  var prefixSelect = document.getElementById('subdomainSelect');
  var suffixSelect = document.getElementById('serverSelect');
  var newItemInput = document.getElementById('newItemInput');
  var dataHref01 = document.getElementById('dataHref01');
  var dataHref02 = document.getElementById('dataHref02');
  var currentHref = window.location.href;
  var appdedChildsList = dataHref01.childNodes;
  var oldAppdedChildsList = dataHref02.childNodes; // Safety check - ensure elements exist to avoid null dereference

  /* if (!prefixSelect || !suffixSelect || !newItemInput || !dataHref01) {
      console.error('Missing form elements in appendSelectedValue:', { prefixSelect, suffixSelect, newItemInput, dataHref01 });
      return;
  } */
  // Ensure we have a valid base anchor; if not, create/update it from selects

  var anchor = dataHref01.querySelector('a');

  if (!newItemInput.value) {
    // build base href from selects
    var prefix = prefixSelect.value || '';
    var suffix = suffixSelect.value || '';
    /* if (!suffix) {
        console.error('No server selected to build base URL');
        return;
    } */

    var baseHref = 'http://';
    if (prefix) baseHref += prefix + '.' + suffix;else baseHref += suffix; // ensure trailing slash for base

    if (!baseHref.endsWith('/')) baseHref += '/';
    anchor = document.createElement('a');
    anchor.href = baseHref;
    anchor.textContent = baseHref;
    anchor.target = '_blank';
    updateDataHref01.innerHTML = 'newItemInput.value';
    dataHref01.innerHTML = 'newItemInput.value';
    dataHref01.appendChild(anchor); // preserve a copy in dataHref02

    dataHref02.innerHTML = dataHref01.innerHTML;
  }

  var newItemValue = newItemInput.value.trim();
  /* if (!newItemValue) {
      // nothing to append; just ensure anchor exists
      showActionToast('Base URL ready');
      return;
  }*/
  // Build final href by joining base and new path

  try {
    var base = anchor.href || ''; // remove any surrounding whitespace

    base = base.trim(); // ensure exactly one slash between base and path

    var path = newItemValue.replace(/^\/+/, '');
    var _final = base;
    if (!_final.endsWith('/')) _final += '/';
    _final = _final + path; // update anchor

    anchor.href = _final;
    anchor.textContent = _final; // copy to dataHref02 for history

    dataHref02.innerHTML = dataHref01.innerHTML; // clear input
    // newItemInput.value = '';

    showActionToast('Added path');
  } catch (e) {
    console.error('Failed to append path:', e);
  }
}

function updateDataHref01() {
  var prefixSelect = document.getElementById('subdomainSelect');
  var suffixSelect = document.getElementById('serverSelect');
  var dataHref01 = document.getElementById('dataHref01');
  var dataHref02 = document.getElementById('dataHref02'); // Safety check - ensure elements exist

  if (!prefixSelect || !suffixSelect || !dataHref01) {
    console.error('Missing form elements:', {
      prefixSelect: prefixSelect,
      suffixSelect: suffixSelect,
      dataHref01: dataHref01
    });
    return;
  } // Preserve previous


  if (dataHref01.innerHTML) {
    dataHref02.innerHTML = dataHref01.innerHTML;
  }

  var prefix = prefixSelect && prefixSelect.value ? prefixSelect.value : '';
  var suffix = suffixSelect && suffixSelect.value ? suffixSelect.value : '';
  /* if (!suffix) {
      console.error('No server selected to update domain');
      return;
  } */

  var href = 'https://';
  if (prefix) href += prefix + '.' + suffix;else href += suffix;
  if (!href.endsWith('/')) href += '/'; // Create or update anchor

  var anchor = dataHref01.querySelector('a');

  if (!anchor) {
    anchor = document.createElement('a');
    anchor.target = '_blank';
    dataHref01.innerHTML = '';
    dataHref01.appendChild(anchor);
  }

  anchor.href = href;
  anchor.textContent = href;
  showActionToast('Domain updated');
} // Small helper to show a transient toast near the top-right of the page


function showActionToast(message) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2200;

  try {
    var toast = document.getElementById('adb-action-toast');

    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'adb-action-toast';
      Object.assign(toast.style, {
        position: 'fixed',
        right: '16px',
        top: '16px',
        background: 'rgba(0,0,0,0.78)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        zIndex: 99999,
        fontSize: '13px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
      });
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1'; // fade and remove after timeout

    setTimeout(function () {
      toast.style.transition = 'opacity 300ms ease';
      toast.style.opacity = '0';
    }, timeout - 300);
    setTimeout(function () {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, timeout + 60);
  } catch (e) {
    // silently ignore in environments where DOM isn't available
    console.debug('showActionToast failed', e);
  }
}
//# sourceMappingURL=dynamicdrop.dev.js.map
