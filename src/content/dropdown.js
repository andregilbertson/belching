function toggleDropdownVisibility(dropdown) {
    if (dropdown.classList.contains("hidden")) {
        dropdown.classList.remove("hidden");
        return;
    }

    dropdown.classList.add("hidden");
}

function generateListItem(container) {
    let ul;

    for (let child of container.children) {
        if (child.tagName === "UL") {
            ul = child;
            break;
        }
    }

    if (ul === null) {
        return;
    }

    const li = document.createElement("li");
    ul.appendChild(li);
    return li;
}

function dropdownIsVisible(dropdown) {
    return dropdown.classList.contains("hidden");
}

module.exports = {
    generateListItem,
    toggleDropdownVisibility,
    dropdownIsVisible,
};
