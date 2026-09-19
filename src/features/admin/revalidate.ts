import "server-only";
import { revalidatePath } from "next/cache";

/** Kontent o'zgarganda barcha ommaviy sahifalar keshini yangilash (sayt kichik — bu arzon). */
export function revalidateSite() {
  revalidatePath("/", "layout");
}
