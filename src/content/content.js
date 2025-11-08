var processPromptText = require("./app.js");
var spellCheckUI = require("./spellcheck-ui.js").spellCheckUI;

(function () {
    var containerSelector = ".ms-auto.flex.items-center.gap-1\\.5";

    function addIcon() {
        var container = document.querySelector(containerSelector);
        if (!container) {
            console.log("failed container");
            return;
        }

        // Don't add multiple icons
        if (container.querySelector(".custom-icon")) return;

        var icon = document.createElement("div");
        icon.className = "custom-icon";
        icon.textContent = "✨"; // or use an <img> or <svg> inside
        icon.title = "Magic Icon";

        // Click event (currently blank)
        icon.addEventListener("click", function() {
            // TODO: fill in functionality
            console.log("Icon clicked!");
            var ps = document.querySelectorAll("#prompt-textarea p");
            var promptText = Array.from(ps)
                .map(function(p) { return p.textContent.trim(); })
                .join("\n");
            console.log("Prompt Text:", promptText);

            processPromptText(promptText); // <- call your logic
            // Tags you want to extract text from
            var TAGS = ["div", "p", "strong", "code"];

            var articles = document.querySelectorAll("article");

            var chatText = Array.from(articles)
                .map(function(article) {
                    var role = article.getAttribute("data-role") || "unknown";

                    // Collect text from all desired tags inside the article
                    var text = Array.from(
                        article.querySelectorAll(TAGS.join(","))
                    )
                        .map(function(el) { return el.innerText.trim(); })
                        .filter(Boolean) // remove empty strings
                        .join("\n");

                    return { role: role, text: text };
                })
                .filter(function(chat) { return chat.text != ""; });

            console.log(chatText);
        });

        container.insertBefore(icon, container.firstChild);
        console.log("✅ Circular icon added");
    }

    // Initialize spellcheck UI - run once, 5 seconds after page load
    function initSpellCheck() {
        // Don't try if already initialized
        if (spellCheckUI.initialized) {
            return;
        }
        
        // Only target #prompt-textarea
        var textarea = document.querySelector('#prompt-textarea');
        
        if (textarea) {
            console.log('✅ Found textarea with selector: #prompt-textarea', 'tagName:', textarea.tagName, 'contentEditable:', textarea.contentEditable);
            spellCheckUI.init('#prompt-textarea').catch(function(err) {
                console.error('Failed to initialize spellcheck:', err);
            });
        } else {
            console.log('Spellcheck: #prompt-textarea not found after 5 seconds');
        }
    }

    // Run initially
    addIcon();
    
    // Initialize spellcheck once, 5 seconds after page load
    setTimeout(initSpellCheck, 5000);

    // Re-add icon if container is rebuilt dynamically
    var observer = new MutationObserver(function() {
        addIcon();
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
