"use server";

/**
 * 카테고리 관리 화면이 호출하는 서버 액션.
 *
 * 지출 쪽과 같은 원칙이다 — 여기서는 FormData 파싱과 캐시 갱신만 하고,
 * 인증·소유권·Prisma 는 `@/lib/categories` 가 맡는다.
 *
 * 지출 액션과 달리 `redirect` 를 쓰지 않는다. 카테고리는 목록 화면에서 그 자리로 고치는
 * 인라인 편집이라 이동할 곳이 없고, 결과는 반환하는 상태로만 알린다.
 */
import { revalidatePath } from "next/cache";

import {
  createCategory,
  deleteCategory,
  updateCategory,
  validateCategoryInput,
} from "@/lib/categories";
import { toCategoryColor } from "@/lib/category-colors";

export type ActionState = {
  errors?: { name?: string; color?: string };
  message?: string;
};

const CATEGORY_PATH = "/categories";
const EXPENSE_PATH = "/expenses";

/** 카테고리 이름·색은 지출 목록의 뱃지에도 그대로 나오므로 두 경로를 함께 갱신한다. */
function revalidateAll(): void {
  revalidatePath(CATEGORY_PATH);
  revalidatePath(EXPENSE_PATH);
}

function toTrimmed(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** 인증 실패는 폼 메시지로 덮지 않고 그대로 올려보낸다. */
function toMessage(err: unknown): ActionState {
  if (err instanceof Error) {
    if (err.message === "Unauthorized") throw err;
    return { message: err.message };
  }
  throw err;
}

export async function createCategoryAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = toTrimmed(formData.get("name"));
  const color = toTrimmed(formData.get("color"));

  const errors = validateCategoryInput(name, color);
  if (errors.name || errors.color) return { errors };

  try {
    // 검증을 통과했으므로 팔레트 안의 값임이 보장된다. 여기서는 타입만 좁힌다.
    await createCategory(name, toCategoryColor(color));
  } catch (err) {
    return toMessage(err);
  }

  revalidateAll();
  return {};
}

export async function updateCategoryAction(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = toTrimmed(formData.get("name"));
  const color = toTrimmed(formData.get("color"));

  const errors = validateCategoryInput(name, color);
  if (errors.name || errors.color) return { errors };

  try {
    await updateCategory(id, name, toCategoryColor(color));
  } catch (err) {
    return toMessage(err);
  }

  revalidateAll();
  return {};
}

/**
 * 카테고리만 지운다. 이 카테고리를 쓰던 지출은 남아서 "미분류"가 된다
 * (스키마가 `onDelete: SetNull`). 그래서 지출 목록도 함께 갱신해야 뱃지가 제때 바뀐다.
 */
export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = toTrimmed(formData.get("id"));
  if (!id) return;

  await deleteCategory(id);
  revalidateAll();
}
