// ==UserScript==
// @name         Monkeytype keyboard
// @version      0.1
// @description  Monkeytype keyboard
// @author       You
// @match        https://monkeytype.com/*
// @match        https://charatyping.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  $("#keymap").replaceWith(
    $(
      '<iframe src="https://keeb.shawn.zone/" height=285 style="border: 0; width: 100%">'
    )
  );
})();
