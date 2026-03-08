import { NextResponse } from "next/server";

import { getTenant, importCatalog } from "@/lib/repository";
import { catalogImportSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = catalogImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid catalog import payload."
        },
        { status: 400 }
      );
    }

    const tenant = getTenant(parsed.data.tenantId);

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found." }, { status: 404 });
    }

    const catalogImport = importCatalog(parsed.data.tenantId, parsed.data.name, parsed.data.mappings);

    return NextResponse.json({ catalogImport });
  } catch {
    return NextResponse.json({ error: "Unable to import catalog." }, { status: 500 });
  }
}
