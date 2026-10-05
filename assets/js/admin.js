/* Vinixx Admin – interactions only (all page content lives in the HTML) */
(function () {
  var $ = function (s, c) {
    return (c || document).querySelector(s);
  };
  var $$ = function (s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  };

  /* ---- Sidebar (mobile) ---- */
  var sidebar = $(".js-sidebar"),
    backdrop = $(".js-sidebar-backdrop"),
    toggle = $(".js-menu-toggle");
  function setSidebar(open) {
    if (!sidebar) return;
    sidebar.classList.toggle("open", open);
    backdrop.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.classList.toggle("active", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (toggle)
    toggle.addEventListener("click", function () {
      setSidebar(!sidebar.classList.contains("open"));
    });
  if (backdrop)
    backdrop.addEventListener("click", function () {
      setSidebar(false);
    });
  $$(".sidebar a").forEach(function (a) {
    a.addEventListener("click", function () {
      setSidebar(false);
    });
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 980) setSidebar(false);
  });

  /* ---- Nav dropdown + profile dropdown ---- */
  $$(".js-nav-dropdown-trigger").forEach(function (t) {
    t.addEventListener("click", function () {
      t.parentElement.classList.toggle("open");
    });
  });
  var pd = $(".js-profile-dropdown"),
    pt = $(".js-profile-trigger");
  if (pt) {
    pt.addEventListener("click", function (e) {
      e.stopPropagation();
      var o = pd.classList.toggle("open");
      pt.setAttribute("aria-expanded", o);
    });
    document.addEventListener("click", function () {
      pd.classList.remove("open");
    });
  }

  /* ---- Toast ---- */
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 2400);
  }

  /* ---- Modals ---- */
  function closeModals() {
    $$(".modal.open").forEach(function (m) {
      m.classList.remove("open");
    });
  }
  $$(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) {
      if (e.target === m) closeModals();
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModals();
  });

  /* ---- Search + status filter for tables ---- */
  $$(".section-card").forEach(function (card) {
    var table = $(".js-table", card);
    if (!table) return;
    var q = $(".js-search", card),
      f = $(".js-filter", card);
    var rows = $$("tbody tr:not(.js-empty)", table),
      empty = $(".js-empty", table);
    function apply() {
      var term = q.value.toLowerCase().trim(),
        st = f.value,
        shown = 0;
      rows.forEach(function (r) {
        if (!r.parentNode) return;
        var ok =
          (!term || r.textContent.toLowerCase().indexOf(term) > -1) &&
          (!st || (r.dataset.status || "") === st);
        r.hidden = !ok;
        if (ok) shown++;
      });
      empty.hidden = shown > 0;
    }
    q.addEventListener("input", apply);
    f.addEventListener("change", apply);
    card._apply = apply;
  });

  /* ---- Row actions (approve / reject / confirm / delete) + modal / toast buttons ---- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.modal) {
      $("#" + b.dataset.modal).classList.add("open");
      return;
    }
    if (b.hasAttribute("data-close")) {
      if (b.dataset.toast) toast(b.dataset.toast);
      closeModals();
      return;
    }
    if (b.dataset.toast) {
      toast(b.dataset.toast);
      return;
    }
    var act = b.dataset.action;
    if (!act) return;
    var row = b.closest("tr"),
      card = b.closest(".section-card");
    if (act === "delete") {
      if (!confirm("Delete this record?")) return;
      row.remove();
      toast("Deleted (demo)");
    } else {
      var status = {
        approve: "approved",
        reject: "rejected",
        confirm: "confirmed",
      }[act];
      var badge = $(".js-status", row);
      if (badge) {
        badge.className = "badge badge-" + status + " js-status";
        badge.textContent = status;
      }
      row.dataset.status = status;
      toast("Marked " + status);
    }
    if (card && card._apply) card._apply();
  });
})();
