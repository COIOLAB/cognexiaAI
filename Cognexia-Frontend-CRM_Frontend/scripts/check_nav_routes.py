from __future__ import annotations

import pathlib
import re


def main() -> None:
    root = pathlib.Path(
        r"C:/Users/nshrm/Desktop/CognexiaAI-ERP/frontend/client-admin-portal"
    )
    sidebar_path = root / "components" / "Sidebar.tsx"
    sidebar = sidebar_path.read_text(encoding="utf-8")
    nav = re.findall(r"href:\s*'([^']+)'", sidebar)

    pages = list(root.glob("app/**/page.tsx"))
    routes: set[str] = set()
    for page in pages:
        rel = page.relative_to(root / "app")
        parts = rel.parts[:-1]
        route_parts: list[str] = []
        for part in parts:
            if part.startswith("(") and part.endswith(")"):
                continue
            if part.startswith("[") and part.endswith("]"):
                route_parts.append(f":{part[1:-1]}")
            else:
                route_parts.append(part)
        routes.add("/" + "/".join(route_parts) if route_parts else "/")

    missing = [href for href in nav if href not in routes]
    print("NAV_COUNT", len(nav))
    print("ROUTE_COUNT", len(routes))
    print("MISSING_ROUTES")
    for href in missing:
        print(href)


if __name__ == "__main__":
    main()
