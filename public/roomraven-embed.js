(function () {
  function resolveTarget(mountTarget) {
    if (typeof mountTarget === "string") {
      return document.querySelector(mountTarget);
    }

    return mountTarget;
  }

  function buildUrl(baseUrl, config) {
    var params = new URLSearchParams({
      tenantId: config.tenantId,
      locale: config.locale || "en",
      roomType: config.roomType || "bathroom",
      embed: "1"
    });

    return (baseUrl || window.location.origin) + "/planner?" + params.toString();
  }

  window.RoomRaven = {
    init: function init(config) {
      if (!config || !config.tenantId || !config.mountTarget) {
        throw new Error("RoomRaven.init requires tenantId and mountTarget.");
      }

      var target = resolveTarget(config.mountTarget);
      if (!target) {
        throw new Error("RoomRaven mount target could not be found.");
      }

      var iframe = document.createElement("iframe");
      iframe.src = buildUrl(config.baseUrl, config);
      iframe.title = "RoomRaven planner";
      iframe.style.width = "100%";
      iframe.style.border = "0";
      iframe.style.minHeight = "760px";
      iframe.style.borderRadius = "24px";
      iframe.style.background = "transparent";
      iframe.loading = "lazy";

      function handleMessage(event) {
        if (!event.data || event.data.type !== "roomraven:height") {
          return;
        }

        iframe.style.height = Math.max(event.data.height, 760) + "px";
      }

      window.addEventListener("message", handleMessage);
      target.innerHTML = "";
      target.appendChild(iframe);

      return {
        iframe: iframe,
        destroy: function destroy() {
          window.removeEventListener("message", handleMessage);
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }
      };
    }
  };
})();
