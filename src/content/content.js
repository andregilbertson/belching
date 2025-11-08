const processPromptText = require("./app.js");
const ddTools = require("./dropdown.js");

(function () {
    const containerSelector = ".ms-auto.flex.items-center.gap-1\\.5";

    function addIcon() {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.log("failed container");
            return;
        }

        // Don't add multiple icons
        if (container.querySelector(".custom-icon")) return;

        const icon = document.createElement("div");
        icon.className = "custom-icon unselectable";
        icon.textContent = "✨"; // or use an <img> or <svg> inside
        icon.title = "Magic Icon";

        const dropdown = document.createElement("div");

        document.body.appendChild(dropdown);
        dropdown.appendChild(document.createElement("ul"));
        dropdown.classList.add("dropdown");
        dropdown.classList.add("hidden");

        // Click event (currently blank)
        icon.addEventListener("click", (e) => {
            // TODO: fill in functionality
            console.log("Icon clicked!");
            const ps = document.querySelectorAll("#prompt-textarea p");
            const promptText = Array.from(ps)
                .map((p) => p.textContent.trim())
                .join("\n");
            console.log("Prompt Text:", promptText);

            processPromptText(promptText); // <- call your logic
            // Tags you want to extract text from
            const TAGS = ["div", "p", "strong", "code"];

            const articles = document.querySelectorAll("article");

            const chatText = Array.from(articles)
                .map((article) => {
                    const role = article.getAttribute("data-role") || "unknown";

                    // Collect text from all desired tags inside the article
                    const text = Array.from(
                        article.querySelectorAll(TAGS.join(","))
                    )
                        .map((el) => el.innerText.trim())
                        .filter(Boolean) // remove empty strings
                        .join("\n");

                    return { role, text };
                })
                .filter((chat) => chat.text != "");

            console.log(chatText);

            ddTools.toggleDropdownVisibility(dropdown);

            if (!ddTools.dropdownIsVisible(dropdown)) {
                const rect = e.target.getBoundingClientRect();
                const top = rect.top;
                const left = rect.left;

                const width = dropdown.offsetWidth;
                const height = dropdown.offsetHeight;

                dropdown.style.top = `${top - height}px`;
                dropdown.style.left = `${left - width / 2}px`;

                const li = ddTools.generateListItem(dropdown);
                li.innerText = "fhuiefhuiehiufhe";
            }
        });

        window.addEventListener("click", (e) => {
            if (
                ddTools.dropdownIsVisible(dropdown) &&
                !dropdown.contains(e.target) &&
                !icon.contains(e.target)
            ) {
                ddTools.toggleDropdownVisibility(dropdown);
            }
        });

        container.insertBefore(icon, container.firstChild);
        console.log("✅ Circular icon added");
    }

    // Run initially
    addIcon();

    // Re-add if container is rebuilt dynamically
    const observer = new MutationObserver(() => addIcon());
    observer.observe(document.body, { childList: true, subtree: true });
})();
