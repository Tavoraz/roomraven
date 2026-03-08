import { DEFAULT_CATEGORY_LABELS } from "@/lib/constants";
import type { CatalogImport, LayoutOption, ShoppingListItem, Tenant } from "@/lib/types";

export function buildShoppingList(
  tenant: Tenant,
  winner: LayoutOption,
  latestCatalogImport: CatalogImport | null
): ShoppingListItem[] {
  const mappings = latestCatalogImport?.mappings;

  return winner.layout.fixtures.map((fixture) => {
    const catalogMapping = mappings?.[fixture.fixtureType];
    return {
      fixtureType: fixture.fixtureType,
      quantity: 1,
      label: catalogMapping?.label ?? DEFAULT_CATEGORY_LABELS[fixture.fixtureType],
      categoryUrl: catalogMapping?.categoryUrl ?? tenant.categoryLinks[fixture.fixtureType],
      note:
        catalogMapping?.note ??
        `Recommended ${fixture.fixtureType} package based on the selected RoomRaven winner.`
    };
  });
}
