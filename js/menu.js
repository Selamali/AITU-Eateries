(() => {
  const navigation = document.querySelector(".menu-nav-links");
  const panels = [...document.querySelectorAll("#menu-panels > .menu-section")];
  if (!navigation || !panels.length) return;
  const tabs = [...navigation.querySelectorAll("a")];

  function targetFromHash() {
    try {
      return document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      );
    } catch {
      return null;
    }
  }

  function showPanel(id, updateAddress = false) {
    if (!panels.some((panel) => panel.id === id)) return;
    panels.forEach((panel) => {
      panel.hidden = panel.id !== id;
    });
    tabs.forEach((tab) => {
      const selected = tab.getAttribute("href") === `#${id}`;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    // Updating the fragment through history does not scroll the viewport.
    if (updateAddress) history.replaceState(null, "", `#${id}`);
  }

  navigation.setAttribute("role", "tablist");
  navigation.setAttribute("aria-label", "Dining spot menus");
  tabs.forEach((tab, index) => {
    const id = tab.getAttribute("href").slice(1);
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", id);
    const panel = panels.find((item) => item.id === id);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.tabIndex = 0;
    tab.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      showPanel(id, true);
    });
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else if (event.key === " ") {
        event.preventDefault();
        showPanel(id, true);
        return;
      } else return;
      event.preventDefault();
      showPanel(tabs[next].getAttribute("href").slice(1), true);
      tabs[next].focus({ preventScroll: true });
    });
  });

  function openLinkedMenu(scrollToGroup = false) {
    const target = targetFromHash();
    const panel = target?.closest(".menu-section");
    showPanel(panel?.id || panels[0].id);
    // Category links from Dining Spots still open their exact menu group.
    if (scrollToGroup && panel && target !== panel) {
      target.scrollIntoView({ block: "start" });
    }
  }
  openLinkedMenu();
  window.addEventListener("load", () => openLinkedMenu(true), { once: true });
  window.addEventListener("hashchange", () => openLinkedMenu(true));
})();
