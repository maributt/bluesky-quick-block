// ==UserScript==
// @name         Block button in dropdown
// @version      2024-10-19
// @description  because going to the profile takes too long.
// @author       Tanza3D
// @updateUrl    https://raw.githubusercontent.com/Tanza3D/bluesky-quick-block/refs/heads/main/blockbutton.user.js
// @match        https://bsky.app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsky.app
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    (function() {
        'use strict';

        function addButtonToDropdown(menu) {
            if (!menu.classList.contains('new-dropdown-button')) {
                menu.classList.add("new-dropdown-button");
                menu.addEventListener('click', () => {
                    var account = JSON.parse(localStorage.getItem('BSKY_STORAGE')).session.currentAccount;
                    setTimeout(() => {
                        var list = document.querySelector('[role="menu"][data-state="open"]').querySelector(".css-175oi2r");
                        var buttonToClone = list.querySelector('[data-testid="postDropdownMuteWordsBtn"');
                        var button = buttonToClone.cloneNode(true)
                        list.appendChild(button);
                        button.querySelector(".css-146c3p1").innerText = "Block User";
                        list.insertBefore(button, buttonToClone);

                        var postItem = menu.closest('[data-testid^="feedItem-by-"]');
                        if(postItem == null) postItem = menu.closest('[data-testid^="postThreadItem-by-"]');

                        console.log(postItem);

                        var handle = "";

                        var tmp = postItem.querySelectorAll('a');
                        console.log(tmp);
                        for(var i of tmp) {
                            if(i.querySelector("span") == null) continue;
                            console.log(i.querySelector("span").innerText)
                            if(i.querySelector("span").innerText.trim().startsWith("@") && i.href.includes("/profile")) handle = i.querySelector("span").innerText.trim();
                        }

                        var pfp = postItem.querySelector('[data-testid="userAvatarImage"]').querySelector("img").src;
                        var did = pfp.split("/");
                        for(var v of did) {
                            if(v.startsWith("did:")) {
                                did = v.split("@")[0];
                            }
                        }

                        button.style.background = "#ff000022";

                        button.addEventListener("click", async () => {
                            if (window.confirm('Are you sure you want to block ' + handle + "? (" + did + ")? There will be no visual indication, you will have to refresh the page")) {
                                await fetch(account.pdsUrl+"xrpc/com.atproto.repo.createRecord", {
                                    method: "POST",
                                    headers: {
                                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
                                        "Accept": "*/*",
                                        "Content-Type": "application/json",
                                        "Authorization": "Bearer " + account.accessJwt,
                                        "Origin": "https://bsky.app",
                                    },
                                    body: JSON.stringify({
                                        collection: "app.bsky.graph.block",
                                        repo: account.did,
                                        record: {
                                            subject: did,
                                            createdAt: new Date().toISOString(),
                                            $type: "app.bsky.graph.block"
                                        }
                                    })
                                });
                            }
                        });
                    }, 30)
                });


            }
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const dropdowns = document.querySelectorAll('[data-testid="postDropdownBtn"]');
                for (var dropdown of dropdowns) {
                    addButtonToDropdown(dropdown);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    })();

})();
