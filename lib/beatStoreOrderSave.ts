import { Prisma } from "@prisma/client";

export type BeatStoreOrderSaveResult = {
  catalogueMatches: boolean;
  items: Array<{ id: string; storeOrder: number }>;
};

export function beatStoreOrderStatement(ids: string[]) {
  // One parameterized statement avoids a separate database round trip for each
  // beat. Lock active rows in a consistent order before checking the complete
  // catalogue, so a concurrent removal cannot leave a partly saved order.
  // A beat created after the statement's snapshot keeps its default end position.
  return Prisma.sql`
    WITH requested AS MATERIALIZED (
      SELECT value AS id, position::integer AS "storeOrder"
      FROM jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb)
        WITH ORDINALITY AS entries(value, position)
    ),
    catalogue AS MATERIALIZED (
      SELECT id FROM public."Beat"
      WHERE "deletedAt" IS NULL
      ORDER BY id
      FOR UPDATE
    ),
    validation AS MATERIALIZED (
      SELECT
        (SELECT count(*) FROM catalogue) = (SELECT count(*) FROM requested)
        AND NOT EXISTS (
          SELECT 1 FROM requested
          LEFT JOIN catalogue ON catalogue.id = requested.id
          WHERE catalogue.id IS NULL
        ) AS ok
    ),
    updated AS (
      UPDATE public."Beat" AS beat
      SET "storeOrder" = requested."storeOrder"
      FROM requested
      WHERE beat.id = requested.id
        AND beat."deletedAt" IS NULL
        AND (SELECT ok FROM validation)
      RETURNING beat.id, beat."storeOrder"
    )
    SELECT validation.ok AS "catalogueMatches",
      COALESCE(
        jsonb_agg(jsonb_build_object('id', updated.id, 'storeOrder', updated."storeOrder")
          ORDER BY updated."storeOrder") FILTER (WHERE updated.id IS NOT NULL),
        '[]'::jsonb
      ) AS items
    FROM validation LEFT JOIN updated ON true
    GROUP BY validation.ok
  `;
}
