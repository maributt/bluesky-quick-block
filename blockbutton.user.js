// ==UserScript==
// @name         Block button in dropdown
// @version      2024-10-21
// @description  because going to the profile takes too long.
// @author       Tanza3D
// @updateUrl    https://raw.githubusercontent.com/maributt/bluesky-quick-block/refs/heads/main/blockbutton.user.js
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
                        var buttonToClone = list.querySelector('[data-testid="postDropdownReportBtn"');
                        var button = buttonToClone.cloneNode(true)
                        list.appendChild(button);
                        button.querySelector(".css-146c3p1").innerText = "Block User";
                        // from https://github.com/omurilo/bsky-one-click-block/blob/82010d0b128a50cba12c8b9a0de481330975338d/index.js#L84
                        button.childNodes[1].innerHTML = `<svg fill="none" viewBox="0 0 24 24" width="20" height="20"><path fill="hsl(211, 20%, 73.6%)" fill-rule="evenodd" clip-rule="evenodd" d="M12 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM7.5 6.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM5.679 19c.709-2.902 3.079-5 6.321-5 .302 0 .595.018.878.053a1 1 0 0 0 .243-1.985A9.235 9.235 0 0 0 12 12c-4.3 0-7.447 2.884-8.304 6.696-.29 1.29.767 2.304 1.902 2.304H12a1 1 0 1 0 0-2H5.679Zm9.614-3.707a1 1 0 0 1 1.414 0L18 16.586l1.293-1.293a1 1 0 0 1 1.414 1.414L19.414 18l1.293 1.293a1 1 0 0 1-1.414 1.414L18 19.414l-1.293 1.293a1 1 0 0 1-1.414-1.414L16.586 18l-1.293-1.293a1 1 0 0 1 0-1.414Z"></path></svg>`;
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

                            button.querySelector(".css-146c3p1").innerText = "User Blocked ✅";
                            button.style.background = "#00ff0022";
                            button.style.cursor = "default";

                            // // tweet's content
                            // var content = postItem.querySelector('[data-testid="contentHider-post"]');
                            // // hide
                            // content.style.display = "none";
                            // // remove
                            // content.remove();

                            // remove post entirely
                            // // hide
                            // postItem.style.display = "none";
                            // // remove
                            postItem.remove();

                            // unfocus menu
                            document.querySelector('[aria-label="Context menu backdrop, click to close the menu."]').click();

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
                        });
                    }, 30, { once: true })
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
